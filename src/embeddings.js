import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
export const EMBEDDING_SIZE = 384; // Size of the embedding vector for the model

let _extractor;

async function getPipeline() {
    if (!_extractor) {
        console.log('Setup transformers pipeline');

        // Check if WebGPU is available
        const hasWebGPU = navigator.gpu !== undefined;
        console.log(`WebGPU support: ${hasWebGPU}`);

        var extractionPipeline = await pipeline('feature-extraction', MODEL_NAME, {
            backend: hasWebGPU ? 'webgpu' : 'cpu',
            progress_callback: reportProgress
        });
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

function reportProgress(progress) {
    if (progress.status === 'progress')
        console.log(`Loading model: ${Math.round(progress.progress)}%`);
    else if (progress.status === 'ready')
        console.log('Model ready');
}