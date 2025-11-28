import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Vehicle, Driver } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFleetStatusReport = async (vehicles: Vehicle[], drivers: Driver[]): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Analyze the following transportation fleet data and provide a concise executive summary status report.
      Highlight any critical issues (low fuel, maintenance) and driver utilization.
      Format the output in Markdown.
      
      Vehicles: ${JSON.stringify(vehicles)}
      Drivers: ${JSON.stringify(drivers)}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a senior logistics analyst assistant.",
        temperature: 0.3,
      }
    });

    return response.text || "Unable to generate report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating fleet report. Please check your API key.";
  }
};

export const chatWithAssistant = async (
  message: string, 
  context: { vehicles: Vehicle[]; drivers: Driver[] }
): Promise<string> => {
  try {
    const ai = getClient();
    const systemInstruction = `
      You are Nexus AI, the intelligent assistant for the Nexus Logistics TMS.
      You have access to the current fleet state.
      Answer questions about vehicle locations, driver status, and general logistics efficiently.
      Be helpful, professional, and concise.

      Current Context:
      Vehicles: ${JSON.stringify(context.vehicles)}
      Drivers: ${JSON.stringify(context.drivers)}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I didn't catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the network right now.";
  }
};

export const optimizeRoute = async (stops: string[]): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `I have a delivery route with the following un-ordered stops: ${stops.join(', ')}. 
    Please suggest an optimal order for these stops starting from a hypothetical central depot, and explain why.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not optimize route.";
  } catch (error) {
    return "Error optimizing route.";
  }
};
