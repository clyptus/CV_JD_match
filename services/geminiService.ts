import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize the client. 
// NOTE: process.env.API_KEY is automatically injected in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeResume = async (
  resumeBase64: string,
  resumeMimeType: string,
  jobDescription: string
): Promise<AnalysisResult> => {
  
  // Define the expected output schema
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      matchScore: {
        type: Type.INTEGER,
        description: "A score from 0 to 100 indicating how well the resume matches the job description.",
      },
      atsScore: {
        type: Type.INTEGER,
        description: "A score from 0 to 100 indicating how ATS-friendly the resume formatting and keyword usage is.",
      },
      summary: {
        type: Type.STRING,
        description: "A brief executive summary of the analysis (max 2 sentences).",
      },
      matchingSkills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of hard and soft skills found in both the resume and job description.",
      },
      missingSkills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Critical skills mentioned in the job description that are missing or weak in the resume.",
      },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key strong points of the candidate.",
      },
      weaknesses: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Areas where the candidate falls short compared to the requirements.",
      },
      recommendedActions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Specific, actionable advice to improve the resume for this specific job.",
      },
    },
    required: ["matchScore", "atsScore", "summary", "matchingSkills", "missingSkills", "strengths", "weaknesses", "recommendedActions"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are an expert HR Resume Analyzer and ATS (Applicant Tracking System) specialist. 
            Analyze the provided resume against the job description below. 
            Be critical but constructive.
            
            JOB DESCRIPTION:
            ${jobDescription}
            
            Analyze the attached resume file.`
          },
          {
            inlineData: {
              mimeType: resumeMimeType,
              data: resumeBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for consistent analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const optimizeResumeWithNewSkill = async (
  currentAnalysis: AnalysisResult,
  newSkill: string
): Promise<AnalysisResult> => {
    // This function simulates the "Add Skill" feature by asking Gemini to hallucinate the impact of adding a specific skill
    // In a real app, this might involve rewriting the resume text, but here we re-score based on the hypothetical addition.
    
    const prompt = `
      The user wants to update their resume to include the skill: "${newSkill}".
      
      Current Analysis Status:
      - Match Score: ${currentAnalysis.matchScore}
      - Missing Skills: ${currentAnalysis.missingSkills.join(', ')}
      
      Assume the user effectively adds "${newSkill}" to their resume. 
      Re-calculate the scores and update the lists. 
      Remove "${newSkill}" from missingSkills and add it to matchingSkills.
      Increase the matchScore appropriately (usually by 5-10 points depending on relevance).
      Keep the summary mostly the same but mention the improvement.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER },
          atsScore: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      };

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
    
        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
    
        return JSON.parse(text) as AnalysisResult;
    } catch (error) {
        console.error("Error re-scoring:", error);
        throw error;
    }
}
