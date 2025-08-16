import * as storage from './storage';

const sampleData = [
    { id: 1, title: "Cats", content: "Cats are small predators often kept as pets." },
    { id: 2, title: "Dogs", content: "Dogs are known for their loyalty and often used as guard animals." },
    { id: 3, title: "Birds", content: "Birds can fly, have feathers, and a beak." }
];


(async () => {
    try {
        const conn = await storage.connectToDb();

        // Check if table is empty
        const count = await storage.getDocumentsCount(conn);
        console.log('Documents count:', count);

        // Insert sample data if table is empty
        if (count == 0) {
            storage.insertDocuments(conn, sampleData);
            console.log(`Inserted ${sampleData.length} sample documents into the database`);
        }

        // Verify data
        var typedDocs = await storage.getDocuments(conn);
        console.log('Current documents:', typedDocs);

        // Search for documents
        const searchQuery = 'Flying animal.';
        var results = await storage.searchDocuments(conn, searchQuery)
        console.log(results);

        await conn.close();
    } catch (e) {
        console.error(e);
    } finally {
        await storage.terminateDb()
    }
})();
