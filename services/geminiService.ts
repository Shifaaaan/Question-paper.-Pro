import { GoogleGenAI, Type } from "@google/genai";
import { Question, ExtractionResult } from "../types";

const SYSTEM_INSTRUCTION = `
**Role:**
You are an advanced Academic Content Processing Engine specialized in Optical Character Recognition (OCR), semantic analysis, and document structuring for competitive entrance examinations (e.g., JEE, KEAM, NEET).

**Objective:**
Process images of question papers, extract the content with 100% fidelity, categorize them by topic, and assign a difficulty score.

**CRITICAL INSTRUCTION - ZERO TOLERANCE FOR ERROR:**
1. **Verbatim Extraction:** Transcribe every character, number, symbol, and diagram label exactly.
2. **No Hallucinations:** Do not "fix" grammar. If unclear, mark as [UNCLEAR].
3. **Mathematical Precision & LaTeX:** 
   - You MUST enclose ALL mathematical expressions, chemical formulas, and scientific notations within single dollar signs ($) for inline math (e.g., $x^2 + y^2 = r^2$, $H_2O$).
   - Use standard LaTeX syntax for all math symbols (e.g., $\\int$, $\\alpha$, $\\sqrt{}$).
   - Do NOT use LaTeX for regular text.
4. **Option Integrity:** Keep options exactly associated with their values.

**Output Format:**
Return valid JSON adhering to the specified schema. 
- 'topic' should be the specific sub-chapter (e.g., "Thermodynamics", "Integration").
- 'difficulty' must be an integer from 1 (Basic) to 5 (Advanced).
`;

export const analyzeImage = async (file: File): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Extract all questions from this image, categorizing them by topic and difficulty."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalNumber: { type: Type.STRING, description: "The number as it appears in the image" },
                  text: { type: Type.STRING, description: "The full question text including any instructions. Use $...$ for math." },
                  topic: { type: Type.STRING, description: "Sub-chapter or concept" },
                  difficulty: { type: Type.INTEGER, description: "1-5 score" },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING, description: "e.g., A, B, C, D" },
                        text: { type: Type.STRING, description: "The content of the option. Use $...$ for math." }
                      }
                    }
                  }
                },
                required: ["text", "topic", "difficulty", "options"]
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(response.text) as ExtractionResult;
    return data.questions || [];

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
