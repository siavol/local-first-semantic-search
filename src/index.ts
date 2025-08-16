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
            await storage.insertDocuments(conn, sampleData);
            console.log(`Inserted ${sampleData.length} sample documents into the database`);
        }

        // Setup search button handler
        document
            .getElementById('searchButton')
            ?.addEventListener('click', () => handleSearch(conn));

    } catch (e) {
        console.error(e);
    }
})();

function displayResults(results: storage.DocumentSearchResult[]) {
    const container = document.getElementById('searchResults')!;
    container.innerHTML = results.map(doc => `
        <div class="result-item">
            <h3>${doc.title}</h3>
            <p>${doc.content}</p>
            <small>Similarity: ${Math.round(doc.similarity * 100)}%</small>
        </div>
    `).join('');
}

async function handleSearch(conn: storage.Connection) {
    const query = (document.getElementById('searchInput') as HTMLInputElement).value;
    if (!query) return;

    const results = await storage.searchDocuments(conn, query);
    displayResults(results);
}
