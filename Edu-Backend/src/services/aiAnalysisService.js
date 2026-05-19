import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "missing_api_key";
const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "missing_api_key";

const openai = hasOpenAIKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callWithRetry = async (fn, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = error.status || (error.response && error.response.status);
      const isTransient = status === 503 || status === 429 || 
                          (error.message && (
                            error.message.includes("503") || 
                            error.message.includes("429") || 
                            error.message.includes("high demand") || 
                            error.message.includes("quota") ||
                            error.message.includes("rate limit")
                          ));
      
      if (attempt === retries || !isTransient) {
        throw error;
      }
      
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      console.warn(`⚠️ AI call failed (Attempt ${attempt}/${retries}): ${error.message || error}. Retrying in ${backoffDelay}ms...`);
      await sleep(backoffDelay);
    }
  }
};

const generateMockAnalysis = () => {
  return {
    completenessScore: 82,
    writingQuality: "Satisfactory",
    strengths: ["Clear terminology choice", "Logical narrative flow"],
    weakExplanations: ["Feasibility elements seem slightly thin", "Need direct citations for claims"],
    missingCriteria: [],
    recommendations: ["Elaborate on the concrete scope limits.", "Ensure citations follow standard IEEE/APA rules."]
  };
};

export const performAcademicAIAnalysis = async (text, chapterNumber, chapterTitle) => {
  if (!hasGeminiKey && !hasOpenAIKey) {
    throw new Error("No AI API keys configured (GEMINI_API_KEY or OPENAI_API_KEY). Academic draft analysis cannot be completed.");
  }

  const promptSystem = `You are an expert senior academic thesis panel reviewer and academic advisor.
Your task is to analyze the student draft text for quality and checklist completion.
You MUST respond with a valid JSON block containing exactly these fields (no markdown, no surrounding text):
{
  "completenessScore": number (0-100),
  "writingQuality": "Good" | "Satisfactory" | "Needs Improvement",
  "strengths": ["string"],
  "weakExplanations": ["string"],
  "missingCriteria": ["string"],
  "recommendations": ["string"]
}`;

  const promptUser = `
Chapter Number: ${chapterNumber}
Chapter Title: ${chapterTitle}

Text Snippet:
---
${text.substring(0, 8000)}
---

Analyze the writing quality, depth of explanations, bibliography citations, and structural completeness.
`;

  // 1. Try Gemini
  if (hasGeminiKey) {
    const geminiModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const combinedPrompt = `${promptSystem}\n\n${promptUser}`;
    let lastGeminiError = null;

    for (const modelName of geminiModels) {
      try {
        console.log(`🤖 Attempting academic draft analysis using Gemini model ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const response = await callWithRetry(async () => {
          return await model.generateContent(combinedPrompt);
        }, 3, 1000);

        const cleanedText = response.response.text().trim().replace(/```json|```/g, '');
        const parsedData = JSON.parse(cleanedText);
        
        if (typeof parsedData.completenessScore === 'number') {
          console.log(`✅ Analysis completed successfully using Gemini (${modelName}).`);
          return parsedData;
        }
        throw new Error("Gemini returned a JSON structure missing required fields.");
      } catch (geminiError) {
        console.error(`❌ Gemini model ${modelName} failed:`, geminiError.message || geminiError);
        lastGeminiError = geminiError;
      }
    }

    if (lastGeminiError) {
      console.error("❌ All Gemini models failed for academic draft analysis.");
      if (!hasOpenAIKey) {
        throw lastGeminiError;
      }
      console.log("🤖 Falling back to OpenAI API...");
    }
  }

  // 2. Try OpenAI
  if (hasOpenAIKey && openai) {
    try {
      console.log("🤖 Attempting academic draft analysis using OpenAI...");
      const response = await callWithRetry(async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: promptSystem },
            { role: "user", content: promptUser },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });
      }, 3, 1000);

      const responseText = response.choices[0].message.content;
      const parsedData = JSON.parse(responseText);

      if (typeof parsedData.completenessScore === 'number') {
        console.log("✅ Analysis completed successfully using OpenAI.");
        return parsedData;
      }
      throw new Error("OpenAI returned a JSON structure missing required fields.");
    } catch (openaiError) {
      console.error("❌ OpenAI API failed for academic draft analysis:", openaiError.message || openaiError);
      throw openaiError;
    }
  }

  throw new Error("Academic draft analysis failed. No AI services completed the request successfully.");
};
