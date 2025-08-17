import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
export const EMBEDDING_SIZE = 384; // Size of the embedding vector for the model

let _extractor;

async function getPipeline() {
    if (!_extractor) {
        console.log('Setup transformers pipeline');
        var extractionPipeline = await pipeline('feature-extraction', MODEL_NAME);
        _extractor = extractionPipeline;
    }

    return _extractor;
}

export async function getEmbedding(text) {
    var pipeline = await getPipeline();
    const output = await pipeline(text, { 
        pooling: 'mean', 
        normalize: true 
    });
    return Array.from(output.data);
}
