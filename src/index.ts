import * as duckdb from '@duckdb/duckdb-wasm';
import * as arrow from 'apache-arrow';

type Document = {
    id: arrow.Int;
    title: arrow.Utf8;
    content: arrow.Utf8;
};

(async () => {
    try {
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

        const logger = new duckdb.ConsoleLogger();
        const worker = new Worker(DUCKDB_CONFIG.mainWorker!);
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(DUCKDB_CONFIG.mainModule, DUCKDB_CONFIG.pthreadWorker);
        await db.open({
            path: 'opfs://semsearch.db',
            accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
        });
        console.log('DuckDB WebAssembly instance created!!!');

        const conn = await db.connect();

        // Create documents table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY,
                title TEXT,
                content TEXT
            );
        `);
        console.log('Documents table created');

        // Check if table is empty
        const countTbl = await conn.query<{ count: arrow.Int }>(
            `SELECT COUNT(*) as count FROM documents`
        );
        const [{ count }] = countTbl.toArray();
        console.log('Documents count:', count);
        
        // Insert sample data if table is empty
        if (count == 0) {
            const sampleData = [
                { id: 1, title: "Cats", content: "Cats are small predators often kept as pets." },
                { id: 2, title: "Dogs", content: "Dogs are known for their loyalty and often used as guard animals." },
                { id: 3, title: "Birds", content: "Birds can fly, have feathers, and a beak." }
            ];
            
            const arrowTable = arrow.tableFromJSON(sampleData);
            await conn.insertArrowTable(arrowTable, { 
                name: 'documents',
                create: false
            });
            console.log('Sample data inserted');
        }

        // Verify data
        const docs = await conn.query<Document>(
            `SELECT id, title, content
            FROM documents
            ORDER BY id`
        );
        const typedDocs = docs.toArray()
           .map(row => ({
                id: row.id,
                title: row.title,
                content: row.content
            }));
        console.log('Current documents:', typedDocs);

        await conn.close();
        await db.terminate();
        await worker.terminate();
    } catch (e) {
        console.error(e);
    }
})();
