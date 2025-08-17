# Local-First Semantic Search Demo

A browser-based semantic search demo that runs entirely client-side using WebAssembly. 
Search through documents using natural language queries powered by transformer-based embeddings.

## Technology Stack

- [Transformers.js](https://huggingface.co/docs/transformers.js/index) - ML models running in the browser
- [PGlite](https://pglite.dev/) - Postgres database running in browser using WASM

## Getting Started

1. Run HTTP server
   ```shell
   npx http-server . -p 3000
   ```
2. Open `http://localhost:3000` in your browser

## How It Works

1. Documents are stored in a local PGlite database
2. Each document's text is converted to embeddings using the MiniLM model
3. Search queries are converted to embeddings using the same model
4. Cosine similarity is used to find the most relevant documents
5. Results are ranked by similarity score

