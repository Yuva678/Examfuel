import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API using the key from environment variables.
// The user must add VITE_GEMINI_API_KEY to their .env.local file.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const getModel = () => {
  if (!genAI) {
    throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.');
  }
  // We use gemini-3.5-flash as it is fast and supports multimodal inputs including PDFs.
  return genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
};

/**
 * Generate a summary of the provided document.
 */
export async function generateSummary(base64Data: string, mimeType: string): Promise<string[]> {
  const model = getModel();
  
  const prompt = `
You are an expert academic tutor. Analyze the provided document and extract the 3-5 most important key takeaways or bullet points. 
Return ONLY the bullet points, one per line. Do not include markdown formatting like asterisks or numbers. Just the raw text for each point.
`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType } }
  ]);
  
  const response = result.response.text();
  // Split by newline, filter out empty lines, and clean up any stray bullet characters
  return response.split('\n')
    .map(line => line.replace(/^[-*•]\s*/, '').trim())
    .filter(line => line.length > 0);
}

/**
 * Generate flashcards from the provided document.
 */
export async function generateFlashcards(base64Data: string, mimeType: string): Promise<{q: string, a: string}[]> {
  const model = getModel();
  
  const prompt = `
You are an expert academic tutor. Read the provided document and generate 5 highly effective active-recall flashcards based on the most important concepts.
Return the result strictly as a valid JSON array of objects, where each object has a "q" (question) and an "a" (answer) string property.
Do NOT wrap the output in markdown code blocks. Just output raw JSON.
Example: [{"q": "What is...", "a": "It is..."}, {"q": "Define...", "a": "A concept..."}]
`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType } }
  ]);
  
  let responseText = result.response.text();
  // Clean up markdown block if Gemini accidentally wraps it
  responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(responseText);
  } catch (err) {
    console.error("Failed to parse flashcards JSON:", responseText);
    throw new Error("Failed to generate valid flashcards. Please try again.");
  }
}

/**
 * Answer a conceptual question using the document as context.
 */
export async function answerConcept(query: string, base64Data: string, mimeType: string): Promise<string> {
  const model = getModel();
  
  const prompt = `
You are an expert academic tutor. Use the provided document to answer the student's question accurately.
If the document does not contain the answer, you can supplement with your own knowledge but keep it highly relevant to the context of the document.
Keep the answer concise, easy to understand, and well-structured.

Student Question: ${query}
`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType } }
  ]);
  
  return result.response.text();
}
