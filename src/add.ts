import * as storage from './storage';

(async () => {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('addForm') as HTMLFormElement;
        form?.addEventListener('submit', e => handleSubmit(e));
    });
})();

async function handleSubmit(event: SubmitEvent) {
    event.preventDefault(); // Moved to top of function
    
    try {
        const conn = await storage.connectToDb();
        
        const titleInput = document.getElementById('titleInput') as HTMLInputElement;
        const contentInput = document.getElementById('contentInput') as HTMLTextAreaElement;

        if (!titleInput.value || !contentInput.value) return;

        const count = await storage.getDocumentsCount(conn);
        const newDoc = {
            id: count + 1, // TODO: Use a better ID generation strategy
            title: titleInput.value,
            content: contentInput.value
        };

        console.log(`Inserting document`, newDoc);
        await storage.insertDocuments(conn, [newDoc]);
        console.log(`Inserted document: ${newDoc.title}`);

        const newCount = await storage.getDocumentsCount(conn);
        console.log(`Total documents after insert: ${newCount}`);

        // await conn.close();

        // Show success message
        const message = document.getElementById('successMessage') as HTMLDivElement;
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);

        // Clear form
        (event.target as HTMLFormElement).reset();
    } catch (error) {
        console.error('Failed to add document:', error);
    } finally {
        storage.terminateDb();
    }
}
