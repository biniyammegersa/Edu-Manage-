import { GoogleGenerativeAI } from '@google/generative-ai';

export const performAcademicAIAnalysis = async (text, chapterNumber, chapterTitle) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('⚠️ No GEMINI_API_KEY or OPENAI_API_KEY found. Using mock academic analysis evaluator.');
    return {
      completenessScore: 82,
      writingQuality: "Satisfactory",
      strengths: ["Clear terminology choice", "Logical narrative flow"],
      weakExplanations: ["Feasibility elements seem slightly thin", "Need direct citations for claims"],
      missingCriteria: [],
      recommendations: ["Elaborate on the concrete scope limits.", "Ensure citations follow standard IEEE/APA rules."]
    };
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
      You are an expert senior academic thesis panel reviewer and academic advisor.
      Your task is to analyze the following student draft text for quality and checklist completion:
      Chapter Number: ${chapterNumber}
      Chapter Title: ${chapterTitle}
      
      Text Snippet:
      ---
      ${text.substring(0, 8000)}
      ---
      
      Analyze the writing quality, depth of explanations, bibliography citations, and structural completeness.
      You MUST respond with a valid JSON block containing exactly these fields (no markdown, no surrounding text):
      {
        "completenessScore": number (0-100),
        "writingQuality": "Good" | "Satisfactory" | "Needs Improvement",
        "strengths": ["string"],
        "weakExplanations": ["string"],
        "missingCriteria": ["string"],
        "recommendations": ["string"]
      }
    `;

    const response = await model.generateContent(prompt);
    const cleanedText = response.response.text().trim().replace(/```json|```/g, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini Academic Review API Error:', error);
    return {
      completenessScore: 75,
      writingQuality: "Satisfactory",
      strengths: ["Standard structure followed"],
      weakExplanations: ["Check that descriptions match standard format."],
      missingCriteria: [],
      recommendations: ["Review formatting and headings to ensure compliance with the academic template."]
    };
  }
};
