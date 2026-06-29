import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

const initializeGemini = () => {
    if (!env.GEMINI_API_KEY) {
        return null;
    }
    return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
};

const ai = initializeGemini();

/**
 * Streams an AI chat response based on the organization context and user question.
 *
 * @param question The user's question.
 * @param contextData The deep organization context data.
 * @param onChunk Callback function to handle incoming text chunks.
 */
export const streamOrganizationChatResponse = async (
    question: string,
    contextData: any,
    onChunk: (chunk: string) => void,
): Promise<void> => {
    if (!ai) {
        onChunk(
            "AI Chat is currently unavailable as the Gemini API key is not configured.",
        );
        return;
    }

    const systemPrompt = `
You are an expert Project Management Assistant strictly tied to the organization provided in the context data below.
Your role is to answer questions based ONLY on this context data.
If the user asks a question that is entirely unrelated to the organization, its projects, phases, sprints, or workitems, you must politely decline to answer, stating that you can only answer questions related to the current organization context.

Data Context:
${JSON.stringify(contextData)}

User Question: ${question}
`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: systemPrompt,
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error) {
        console.error("Error streaming AI chat response:", error);
        onChunk("\n\nAn error occurred while generating the AI response.");
    }
};
