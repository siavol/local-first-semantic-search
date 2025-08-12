# Technical Specification: Browser-based Semantic Search Demo

## Goal
Create a fully client-side web application (runs entirely in the browser, no backend) that performs semantic search over a set of locally stored texts using vector embeddings and a local DuckDB-WASM database.

---

## 1. General Requirements
- The application must run **entirely in the browser**, with no server requests for query processing or embedding generation.
- All data (texts, embeddings, database) must be stored **locally** in the browser.
- Code should be kept as simple as possible, without unnecessary optimizations or heavy UI frameworks (plain JavaScript or lightweight React/Solid is acceptable).
- Support modern browsers with WebAssembly and, if available, WebGPU (with fallback to CPU/WASM).

---

## 2. Data
- A small static dataset (5–20 texts) should be bundled with the project as JSON or a JavaScript array.
- Text structure:
  ```json
  {
    "id": 1,
    "title": "Text title",
    "content": "Full text content"
  }

## 3. Embedding Model
- Use the **Transformers.js** library.
- Model: Xenova/all-MiniLM-L6-v2 (Sentence Transformers).
- Embedding dimensionality: 384 or 768 (default for this model is 384).
- The model should be loaded on first run and cached in the browser.
- Use WebGPU if supported, otherwise fall back to WebAssembly/CPU.

## 4. Local Storage (Vector and Tabular)
- Use DuckDB-WASM.
- On initialization:
  1. Create the table:
     ```sql
     CREATE TABLE documents (
     id INTEGER PRIMARY KEY,
     title TEXT,
     content TEXT,
     embedding FLOAT[]
     );
     ```
  2. Compute embeddings for each text and store them in the table.
- Store DuckDB data in IndexedDB to persist between sessions.

## 5. Search Logic
- When a user enters a query:
  1. Generate an embedding for the query.
  2. Retrieve all embeddings from DuckDB.
  3. Compute cosine similarity between the query embedding and each document embedding.
  4. Sort documents by similarity in descending order.
- Return the top N results (default N = 3).
- Cosine similarity can be computed:
  - Directly in SQL (if supported by DuckDB vector functions), or
  - In JavaScript after fetching data.

## 6. User Interface
- A text input field for the search query.
- A "Search" button.
- A results area displaying:
  - Document title
  - Short snippet of text
  - Similarity score (as percentage or 0–1)
- UI should be minimal (HTML + basic styles).

## 7. Non-functional Requirements
- All functionality must work offline after the first load.
- The source code should be easily portable (minimal dependencies).

## 8. Sample Test Data
```json
[
  { "id": 1, "title": "Cats", "content": "Cats are small predators often kept as pets." },
  { "id": 2, "title": "Dogs", "content": "Dogs are known for their loyalty and often used as guard animals." },
  { "id": 3, "title": "Birds", "content": "Birds can fly, have feathers, and a beak." }
]
```