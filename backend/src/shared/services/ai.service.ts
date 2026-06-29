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
 * Generates an AI summary for a dashboard based on the provided metrics and scope.
 *
 * @param scope The scope of the dashboard (e.g., 'Organization', 'Project', 'Phase')
 * @param data The dashboard metrics and details data
 * @returns The generated markdown summary string
 */
export const generateDashboardSummary = async (
    scope: string,
    data: any,
): Promise<string> => {
    if (!ai) {
        return "AI Summary is currently unavailable as the Gemini API key is not configured.";
    }

    const prompt = `
You are an expert Project Management Assistant. Please analyze the following ${scope} dashboard data and provide a professional summary.
Format your response using Markdown bullet points. Focus on:
1. Overall status and progress.
2. Any potential risks, bottlenecks, or blockers (e.g., items on hold, unstarted phases, or skewed workitem distributions).
3. A brief conclusion or recommendation.

Maintain a professional, analytical, and actionable tone.

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
