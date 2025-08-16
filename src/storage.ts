import * as duckdb from '@duckdb/duckdb-wasm';
import * as arrow from 'apache-arrow';
import { getEmbedding } from './embeddings';

const DB_FILE_PATH = 'opfs://semsearch.db';

const _logger = new duckdb.ConsoleLogger();
let _worker: Worker | null = null;
let _db: duckdb.AsyncDuckDB | null = null;

export type Document = {
    id: number;
    title: string;
    content: string;
};

export type DocumentSearchResult = Document & {
    similarity: number;
};



async function getDb() {
    if (!_db) {
        console.log('Creating DuckDB WebAssembly instance');
        const DUCKDB_CONFIG = await duckdb.selectBundle({
            mvp: {
                mainModule: './duckdb-mvp.wasm',
                mainWorker: './wasm/duckdb-browser-mvp.worker.js',
            },
            eh: {
                mainModule: './duckdb-eh.wasm',
                mainWorker: './wasm/duckdb-browser-eh.worker.js',
            },
            coi: {
                mainModule: './duckdb-coi.wasm',
                mainWorker: './wasm/duckdb-browser-coi.worker.js',
                pthreadWorker: './duckdb-browser-coi.pthread.worker.js',
            },
        });
        _worker = new Worker(DUCKDB_CONFIG.mainWorker!);
        _db = new duckdb.AsyncDuckDB(_logger, _worker);
        await _db.instantiate(DUCKDB_CONFIG.mainModule, DUCKDB_CONFIG.pthreadWorker);
        await _db.open({
            path: DB_FILE_PATH,
            accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
        });
        console.log(`DuckDB WebAssembly instanciated at ${DB_FILE_PATH}`);
    }

    return _db;
}

async function initDbStructure(conn: duckdb.AsyncDuckDBConnection) {
    // Create documents table
    await conn.query(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY,
            title TEXT,
            content TEXT,
            embedding FLOAT[384]
        );
    `);
}

export async function connectToDb() {
    const db = await getDb();
    const conn = await db.connect();
    await initDbStructure(conn);
    return conn;
}

export async function getDocumentsCount(conn: duckdb.AsyncDuckDBConnection): Promise<number> {
    const countTbl = await conn.query<{ count: arrow.Int }>(
        `SELECT COUNT(*) as count FROM documents`
    );
    const [{ count }] = countTbl.toArray();
    return count;
}

export async function insertDocuments(conn: duckdb.AsyncDuckDBConnection, documents: Document[]) {
    const documentsWithEmbeddings = await Promise.all(
        documents.map(async (doc) => {
            const embedding = await getEmbedding(doc.content);
            return { ...doc, embedding };
        })
    );
    const arrowTable = arrow.tableFromJSON(documentsWithEmbeddings);
    await conn.insertArrowTable(arrowTable, { 
        name: 'documents',
        create: false
    });
}

export async function getDocuments(conn: duckdb.AsyncDuckDBConnection): Promise<Document[]> {
    const docs = await conn.query(
        `SELECT id, title, content
        FROM documents
        ORDER BY id`
    );
    return docs.toArray()
        .map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
        }));
}

export async function searchDocuments(
    conn: duckdb.AsyncDuckDBConnection,
    query: string,
    limit: number = 5
): Promise<DocumentSearchResult[]> {
    const searchVector = await getEmbedding(query);

    // Perform semantic search using cosine similarity
    const arrayLiteral = `array_value(${searchVector.join(', ')})`;
    console.log('Executing search query');
    const result = await conn.query(`
        SELECT
            id,
            title,
            content,
            array_cosine_similarity(embedding, ${arrayLiteral}) AS similarity
        FROM documents
        ORDER BY similarity DESC
        LIMIT ${limit}
        `);

    const results = result.toArray()
        .map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            similarity: row.similarity
        }));
    return results;
}

export async function terminateDb() {
    if (_db) {
        console.log('Terminating DuckDB instance');
        await _db.terminate();
        _db = null;
    }
    if (_worker) {
        console.log('Terminating DuckDB worker');
        _worker.terminate();
        _worker = null;
    }
}