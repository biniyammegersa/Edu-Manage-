import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing_api_key",
});

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

/**
 * Generates a high-quality mock academic analysis result when API calls fail or are unconfigured.
 * @param {string} title The title of the proposal.
 * @param {object} proposalData The structured sections of the proposal.
 * @returns {object} The structured JSON analysis result.
 */
const generateMockAnalysis = (title, proposalData) => {
  const baseOriginality = 88 + Math.floor(Math.random() * 8); // Generates a realistic score between 88 and 96%
  
  return {
    overallRisk: "Low",
    confidence: 95,
    originalityScore: baseOriginality,
    sectionAnalysis: [
      {
        section: "Introduction and Background",
        risk: "Low",
        issues: [],
        feedback: ["Highly original framing. Clear context provided for the problem domain with solid structural flow."]
      },
      {
        section: "Problem Statement",
        risk: "Low",
        issues: [],
        feedback: ["The problem statement is well-formulated, highlighting a specific, authentic academic gap."]
      },
      {
        section: "Objectives and Scope",
        risk: "Low",
        issues: [],
        feedback: ["Objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and logically aligned."]
      },
      {
        section: "Methodology",
        risk: "Low",
        issues: [],
        feedback: ["Proposed design and methods are technically sound and standard for this type of research."]
      },
      {
        section: "References and Citations",
        risk: "Low",
        issues: [],
        feedback: ["Citations are appropriately structured and point to genuine academic publication formats."]
      }
    ],
    summary: `The academic review for "${title}" has been successfully completed. The system detected high originality and strong thematic cohesion. There are no major signs of text copying, boilerplate generation, or generic automated structures.`,
    majorConcerns: [],
    recommendations: [
      "Maintain strict documentation of all experimental results.",
      "Consider detailing the testing and verification plan further in the next draft.",
      "Ensure all external datasets or third-party APIs used are explicitly credited."
    ]
  };
};

/**
 * Analyzes a project proposal for plagiarism, AI-generation, and originality.
 * @param {string} title The title of the proposal.
 * @param {object} proposalData The structured sections of the proposal.
 * @returns {Promise<object>} The structured JSON analysis result.
 */
export const analyzeProposal = async (title, proposalData) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "missing_api_key";
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "missing_api_key";

  if (!hasGeminiKey && !hasOpenAIKey) {
    throw new Error("No AI API keys configured (GEMINI_API_KEY or OPENAI_API_KEY). Plagiarism analysis cannot be completed.");
  }

  const systemPrompt = `You are an "Academic Proposal Plagiarism and Originality Reviewer". 
Your task is to analyze the following structured graduation project proposal for plagiarism, originality, generic or AI-generated academic wording, possible fabricated references, paraphrased content, and logical consistency.

Perform a section-by-section analysis. Pay special attention to:
- Background
- Problem Statement
- Objectives
- Academic Merit
- Methodology
- References

Evaluate:
1. Plagiarism probability
2. Originality score (0-100)
3. Academic authenticity
4. Overused proposal wording
5. Paraphrasing indicators
6. Possible fabricated references
7. Logical consistency across sections
8. Uniqueness of problem formulation
9. Human creativity vs generic content

You MUST return your analysis STRICTLY as a JSON object with the following schema:
{
  "overallRisk": "Low" | "Medium" | "High",
  "confidence": number, // 0-100
  "originalityScore": number, // 0-100
  "sectionAnalysis": [
    {
      "section": "string", // name of the section
      "risk": "Low" | "Medium" | "High",
      "issues": ["string"], // specific issues found
      "feedback": ["string"] // actionable feedback
    }
  ],
  "summary": "string", // comprehensive summary of findings
  "majorConcerns": ["string"], // major overarching concerns
  "recommendations": ["string"] // recommendations for improvement
}

Do NOT include any markdown formatting, backticks, or other text outside the JSON object.
`;

  const userPrompt = `Analyze the following proposal:

Title: ${title}

Proposal Data:
${JSON.stringify(proposalData, null, 2)}
`;

  // 1. Try Gemini first if key exists
  if (hasGeminiKey) {
    const geminiModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    let lastGeminiError = null;

    for (const modelName of geminiModels) {
      try {
        console.log(`🤖 Attempting academic proposal analysis using Gemini model ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await callWithRetry(async () => {
          return await model.generateContent(prompt);
        }, 3, 1000);

        const text = result.response.text();
        const cleanedText = text.trim().replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(cleanedText);

        // Validate the basic required structure
        if (parsedData.overallRisk && parsedData.sectionAnalysis) {
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
      console.error("❌ All Gemini models failed.");
      if (!hasOpenAIKey) {
        throw lastGeminiError;
      }
      console.log("🤖 Falling back to OpenAI API...");
    }
  }

  // 2. Try OpenAI as the secondary option or fallback
  if (hasOpenAIKey) {
    try {
      console.log("🤖 Attempting academic proposal analysis using OpenAI...");
      const response = await callWithRetry(async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });
      }, 3, 1000);

      const responseText = response.choices[0].message.content;
      const parsedData = JSON.parse(responseText);
      
      if (parsedData.overallRisk && parsedData.sectionAnalysis) {
        console.log("✅ Analysis completed successfully using OpenAI.");
        return parsedData;
      }
      throw new Error("AI returned malformed JSON structure.");
    } catch (openaiError) {
      console.error("❌ OpenAI API failed:", openaiError.message || openaiError);
      throw openaiError;
    }
  }

  // Edge case safety fallback
  throw new Error("Academic proposal analysis failed. No AI services completed the request successfully.");
};

/**
 * Analyzes a documentation chapter for integrity, technical originality, and content authenticity.
 * Uses a documentation-specific evaluation method — different from the proposal analyzer.
 * @param {number} chapterNumber  The chapter number (1–7).
 * @param {string} chapterType    The chapter type (e.g., "Implementation", "System Design").
 * @param {string} title          The chapter title.
 * @param {string} documentText   The raw extracted text content of the submitted chapter.
 * @returns {Promise<object>}     The structured JSON integrity report.
 */
export const analyzeDocumentation = async (chapterNumber, chapterType, title, documentText) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "missing_api_key";
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "missing_api_key";

  if (!hasGeminiKey && !hasOpenAIKey) {
    throw new Error("No AI API keys configured (GEMINI_API_KEY or OPENAI_API_KEY). Documentation integrity analysis cannot be completed.");
  }

  const systemPrompt = `You are a "Technical Documentation Integrity and Originality Auditor" specialized in reviewing student graduation project chapter submissions.

Your task is to audit the following chapter submission for integrity issues, technical authenticity, and originality. This is NOT a proposal review — this is a technical chapter from a software engineering graduation project.

Chapter context:
- Chapter Number: ${chapterNumber}
- Chapter Type: ${chapterType}

Evaluate the following documentation-specific aspects:
1. **Technical Content Originality**: Is the technical content genuinely original or does it appear copied from textbooks, online tutorials, or other projects?
2. **Implementation Authenticity**: Do implementation details, code descriptions, and architectural decisions appear genuinely authored by the student?
3. **AI-Generated Boilerplate Detection**: Are there signs of AI-generated generic explanations that lack project-specific depth (e.g., vague definitions, filler paragraphs)?
4. **Self-Plagiarism / Inter-Chapter Overlap**: Does the content appear to reuse text verbatim from other chapters without proper context?
5. **Fabricated Results or Diagrams**: Are test results, performance metrics, or system behaviors described in suspiciously generic or idealized terms?
6. **Attribution Integrity**: Are third-party tools, libraries, frameworks, APIs, and external code properly acknowledged?
7. **Technical Depth and Specificity**: Does the writing show genuine understanding of the implemented system, or is it superficially generic?

Return your audit STRICTLY as a JSON object with the following schema:
{
  "overallRisk": "Low" | "Medium" | "High",
  "confidence": number,
  "originalityScore": number,
  "chapterIntegrityScore": number,
  "contentType": "Technical" | "Mixed" | "Generic",
  "chapterAnalysis": [
    {
      "aspect": "string",
      "risk": "Low" | "Medium" | "High",
      "issues": ["string"],
      "feedback": ["string"]
    }
  ],
  "summary": "string",
  "majorConcerns": ["string"],
  "recommendations": ["string"]
}

Field definitions:
- "originalityScore": 0–100, measures how original the text appears vs copied/paraphrased content.
- "chapterIntegrityScore": 0–100, measures the technical authenticity and genuine authorship depth of this specific chapter type.
- "contentType": "Technical" if content is genuinely specific and technical, "Generic" if mostly generic/boilerplate, "Mixed" if a blend.
- "chapterAnalysis": One entry per evaluation aspect above. Include all 7 aspects.

Do NOT include any markdown formatting, backticks, or text outside the JSON object.
`;

  const userPrompt = `Audit the following ${chapterType} chapter submission:

Title: ${title}

Document Content:
${documentText.substring(0, 12000)}
`;

  const geminiModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

  // 1. Try Gemini first
  if (hasGeminiKey) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    let lastGeminiError = null;

    for (const modelName of geminiModels) {
      try {
        console.log(`🤖 Attempting documentation integrity analysis using Gemini model ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await callWithRetry(async () => {
          return await model.generateContent(prompt);
        }, 3, 1000);

        const text = result.response.text();
        const cleanedText = text.trim().replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanedText);

        if (parsedData.overallRisk && parsedData.chapterAnalysis && typeof parsedData.chapterIntegrityScore === "number") {
          console.log(`✅ Documentation integrity analysis completed using Gemini (${modelName}).`);
          return parsedData;
        }
        throw new Error("Gemini returned a JSON structure missing required documentation analysis fields.");
      } catch (geminiError) {
        console.error(`❌ Gemini model ${modelName} failed:`, geminiError.message || geminiError);
        lastGeminiError = geminiError;
      }
    }

    if (lastGeminiError) {
      console.error("❌ All Gemini models failed for documentation integrity analysis.");
      if (!hasOpenAIKey) {
        throw lastGeminiError;
      }
      console.log("🤖 Falling back to OpenAI API...");
    }
  }

  // 2. Try OpenAI as fallback
  if (hasOpenAIKey) {
    try {
      console.log("🤖 Attempting documentation integrity analysis using OpenAI...");
      const response = await callWithRetry(async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });
      }, 3, 1000);

      const responseText = response.choices[0].message.content;
      const parsedData = JSON.parse(responseText);

      if (parsedData.overallRisk && parsedData.chapterAnalysis && typeof parsedData.chapterIntegrityScore === "number") {
        console.log("✅ Documentation integrity analysis completed using OpenAI.");
        return parsedData;
      }
      throw new Error("OpenAI returned a JSON structure missing required documentation analysis fields.");
    } catch (openaiError) {
      console.error("❌ OpenAI API failed for documentation integrity analysis:", openaiError.message || openaiError);
      throw openaiError;
    }
  }

  throw new Error("Documentation integrity analysis failed. No AI services completed the request successfully.");
};
