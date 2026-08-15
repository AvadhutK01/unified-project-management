import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

/**
 * Initializes GoogleGenAI client using GEMINI_API_KEY environment variable.
 * @returns GoogleGenAI instance or null if API key is not configured.
 */
const initializeGemini = () => {
    if (!env.GEMINI_API_KEY) {
        return null;
    }
    return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
};

const ai = initializeGemini();

import type { JsonValue } from "../../types/database.js";

/**
 * Generates an AI summary for a dashboard based on the provided metrics and scope.
 *
 * @param scope The scope of the dashboard (e.g., 'Organization', 'Project', 'Phase')
 * @param data The dashboard metrics and details data
 * @returns The generated markdown summary string
 */
export const generateDashboardSummary = async (
    scope: string,
    data: JsonValue,
): Promise<string> => {
    if (!ai) {
        return "AI Summary is currently unavailable as the Gemini API key is not configured.";
    }

    const prompt = `
Provide a clear, structured analysis of this ${scope} dashboard data.
Format your response using Markdown bullet points. Act as a professional data summarizer. Do not use conversational text, greetings, or concluding remarks.

Focus on providing actionable insights:
1. Overall status, progress, and key metrics highlights.
2. Potential risks, bottlenecks, or blockers (e.g., items on hold, unstarted phases).
3. Any important trends or recommendations based on the data.

Keep the summary comprehensive yet concise enough for a quick read on a dashboard.

Data:
${JSON.stringify(data, null, 2)}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        if (response.text) {
            return response.text;
        } else {
            return "Unable to generate summary at this time.";
        }
    } catch (error) {
        console.error("Error generating AI summary:", error);
        return "An error occurred while generating the AI summary.";
    }
};

/**
 * Streams an AI chat response based on the organization context and user question over WebSockets.
 *
 * @param question The user's question.
 * @param contextData The deep organization context data.
 * @param onChunk Callback function to handle incoming text chunks.
 */
export const streamOrganizationChatResponse = async (
    question: string,
    contextData: JsonValue,
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
