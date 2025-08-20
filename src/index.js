import * as storage from './storage.js';


const sampleData = [
    { title: "Cats", content: "Cats are small predators often kept as pets." },
    { title: "Dogs", content: "Dogs are known for their loyalty and often used as guard animals." },
    { title: "Birds", content: "Birds can fly, have feathers, and a beak." }
];

(async () => {
    try {
        // Check if table is empty
        const count = await storage.getDocumentsCount();
        console.log('Documents count:', count);

        // Insert sample data if table is empty
        if (count == 0) {
            for (const doc of sampleData) {
                await storage.insertDocuments(doc);
            }
            console.log(`Inserted ${sampleData.length} sample documents into the database`);
        }

        // Setup search button handler
        document
            .getElementById('searchButton')
            ?.addEventListener('click', handleSearch);

        // Setup search input Enter key handler
        document
            .getElementById('searchInput')
            ?.addEventListener('keyup', e => {
                if (e.key === 'Enter') handleSearch();
            });

    } catch (e) {
        console.error(e);
    }
})();

function displayResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = results.map(doc => `
        <div class="result-item">
            <h3>${doc.title}</h3>
            <p>${doc.content}</p>
            <small>Similarity: ${Math.round(doc.similarity * 100)}%</small>
        </div>
    `).join('');
}

async function handleSearch() {
    const query = (document.getElementById('searchInput')).value;
    if (!query) return;

    const results = await storage.searchDocuments(query);
    displayResults(results);
}
