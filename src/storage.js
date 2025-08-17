import { PGlite } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js'
import { vector } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/vector/index.js'

import { getEmbedding } from './embeddings.js';

const DB_PATH = 'idb://semsearch';

let _db;
const initialization = (async () => {
    console.log('Initializing PGlite');
    await startDb();
    await initDbStructure();
    console.log('PGlite initialized');
})();

async function startDb() {
    _db = await PGlite.create(DB_PATH, {
        extensions: {
        vector
        },
    });
    await _db.exec('CREATE EXTENSION IF NOT EXISTS vector;')
}

async function initDbStructure() {
    // Create documents table
    await _db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY,
            title TEXT,
            content TEXT,
            embedding vector(384)
        );
    `);
}

export async function getDocumentsCount() {
    await initialization; // Ensure DB is initialized before querying

    const ret = await _db.query(
        `SELECT COUNT(*) as count FROM documents`
    );
    const [{ count }] = ret.rows;
    return Number(count);  // Properly convert BigInt to number
}

export async function insertDocuments(document) {
    await initialization; // Ensure DB is initialized before querying

    const embedding = await getEmbedding(document.content);
    const embeddingLiteral = `[${embedding.join(",")}]`;
    await _db.query(
        `INSERT INTO documents (id, title, content, embedding) 
        VALUES ($1, $2, $3, $4)`,
        [document.id, document.title, document.content, embeddingLiteral]);
}

export async function getDocuments() {
    await initialization; // Ensure DB is initialized before querying

    const docs = await _db.query(
        `SELECT id, title, content
        FROM documents
        ORDER BY id`
    );
    return docs.rows;
}

export async function searchDocuments(query, limit = 5) {
    await initialization; // Ensure DB is initialized before querying

    const searchVector = await getEmbedding(query);
    const searchVectorLiteral = `[${searchVector.join(",")}]`;

    console.log('Executing search query');
    const result = await _db.query(`
        SELECT
            id,
            title,
            content,
            1 - (embedding <=> $1) AS similarity
        FROM documents
        ORDER BY similarity DESC
        LIMIT ${limit}
        `,
        [searchVectorLiteral]);

    const results = result.rows;
    return results;
}
