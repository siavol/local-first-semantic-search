import * as storage from './storage.js';

(async () => {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('addForm');
        form?.addEventListener('submit', handleSubmit);
    });
})();

async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const titleInput = document.getElementById('titleInput');
        const contentInput = document.getElementById('contentInput');

        if (!titleInput.value || !contentInput.value) return;

        const newDoc = {
            title: titleInput.value,
            content: contentInput.value
        };

        console.log(`Inserting document`, newDoc);
        await storage.insertDocuments(newDoc);
        console.log(`Inserted document: ${newDoc.title}`);

        const newCount = await storage.getDocumentsCount();
        console.log(`Total documents after insert: ${newCount}`);

        // Show success message
        const message = document.getElementById('successMessage');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);

        // Clear form
        (event.target).reset();
    } catch (error) {
        console.error('Failed to add document:', error);
    } 
}
