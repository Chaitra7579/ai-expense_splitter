
import { GoogleGenAI, Type } from "@google/genai";
import { AIProcessedExpense } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "Brief summary of the expense.",
    },
    totalAmount: {
      type: Type.NUMBER,
      description: "Total amount in ₹.",
    },
    payer: {
      type: Type.STRING,
      description: "Name of the person who paid the full bill.",
    },
    splits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
        },
        required: ["name", "amount"],
      },
      description: "List of people involved and their specific share in ₹.",
    },
    reminders: {
      type: Type.STRING,
      description: "A friendly, polite reminder message in Hindi/English mix (Hinglish) or plain English for the group.",
    },
  },
  required: ["description", "totalAmount", "payer", "splits", "reminders"],
};

export const processExpenseText = async (text: string): Promise<AIProcessedExpense> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Analyze this expense description and extract structured data.
      Context: Users are friends in India. Amounts are in ₹.
      Rules:
      1. Identify the payer.
      2. Identify the total amount.
      3. Split the amount among the mentioned people. Handle exclusions (e.g., "Veg people don't pay for chicken").
      4. Ensure total splits equal the total amount.
      5. The output must be JSON.

      Input: "${text}"
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  return JSON.parse(response.text.trim());
};

export const processExpenseImage = async (base64Image: string, mimeType: string): Promise<AIProcessedExpense> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `
            Scan this bill image. Extract the total amount, the items, and suggest a fair split among friends.
            If the image doesn't mention names, assume 'Me' as the payer and split equally among 'Me' and 'Friend 1'.
            The output must be JSON.
          `,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  return JSON.parse(response.text.trim());
};
