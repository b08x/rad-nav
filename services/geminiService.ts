
import { GoogleGenAI, Type } from "@google/genai";
import { KNOWLEDGE_BASE_DOCUMENT } from '../constants';

// Ensure the API key is available from environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are an expert assistant for a Healthcare IT imaging platform. Your name is "Navigator AI".
Your knowledge is strictly limited to the provided support documentation.
When answering, be concise and refer to specific sections or systems from the document if possible.
If the user's question cannot be answered using the document, you MUST state: "I cannot find information on that topic in the provided documentation."
Do not invent or assume any information outside of the provided text. Start your first response by introducing yourself.`;

export const queryKnowledgeBase = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `CONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}""" \n\n QUESTION: """${question}"""`,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    return "There was an error processing your request. Please check the console for details.";
  }
};

export interface QAPair {
  question: string;
  answer: string;
}

export const generateQADataset = async (
  topic: string,
  persona: string,
  count: number
): Promise<QAPair[]> => {
  try {
    const systemInstructionForDataset = `You are a data generator for a machine learning model. Your task is to create high-quality question-and-answer pairs based *only* on the provided context document about a Healthcare IT platform. Do not use any external knowledge. The answers must be grounded in the text.`;
    
    const prompt = `Based on the provided documentation, generate exactly ${count} question-and-answer pairs about "${topic}". The questions should be phrased as if they are being asked by a ${persona}. The answers must be concise and derived strictly from the provided documentation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `CONTEXT: """${KNOWLEDGE_BASE_DOCUMENT}""" \n\n TASK: """${prompt}"""`,
      config: {
        systemInstruction: systemInstructionForDataset,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            qa_pairs: {
              type: Type.ARRAY,
              description: "A list of question and answer pairs.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The generated question.",
                  },
                  answer: {
                    type: Type.STRING,
                    description: "The answer to the question, based on the context.",
                  },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: ["qa_pairs"],
        },
      },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.qa_pairs || [];
    
  } catch (error) {
    console.error("Error generating Q&A dataset:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate dataset. Please check the console for details. API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the dataset.");
  }
};
