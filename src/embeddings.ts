import * as transformers from '@huggingface/transformers';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

let _extractor: transformers.FeatureExtractionPipeline;

async function getPipeline() {
    if (!_extractor) {
        console.log('Setup transformers pipeline');
        var extractionPipeline = await transformers.pipeline('feature-extraction', MODEL_NAME);
        _extractor = extractionPipeline;
    }

    return _extractor;
}

export async function getEmbedding(text: string): Promise<number[]> {
    var pipeline = await getPipeline();
    const output = await pipeline(text, { 
        pooling: 'mean', 
        normalize: true 
    });
    return Array.from(output.data);
}
