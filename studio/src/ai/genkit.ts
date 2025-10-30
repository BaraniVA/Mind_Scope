import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with proper configuration
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    })
  ],
  model: 'googleai/gemini-2.0-flash',
});

console.log('🤖 Genkit AI initialized with model: googleai/gemini-2.0-flash');
