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

async function handleSearch() {
    const query = (document.getElementById('searchInput')).value;
    if (!query) return;

    const results = await storage.searchDocuments(query);
    displayResults(results);
}

function displayResults(results) {
    const container = document.getElementById('searchResults');

    // Clear previous results
    container.textContent = '';

    results.forEach(doc => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';

        const title = document.createElement('h3');
        title.textContent = doc.title;

        const content = document.createElement('p');
        content.textContent = doc.content;

        const similarity = document.createElement('small');
        similarity.textContent = `Similarity: ${Math.round(doc.similarity * 100)}%`;

        resultDiv.append(title, content, similarity);
        container.appendChild(resultDiv);
    });
}
