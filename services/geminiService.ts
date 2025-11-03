import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ContentPost, GenerationRequest, GroundingChunk, Framework, TrendingTopic, GeneratedContentBundle, TimingSuggestion, AppMode } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const contentCreatorPrompt = (topic: string): string => `
    You are an expert social media content creator and strategist. Your task is to generate 3 distinct post variations for LinkedIn and 3 for Twitter based on the provided topic, and also provide strategic posting time suggestions.

    **Topic:** ${topic}

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE RULES:**
    1.  **Data Recency:** Use Google Search grounding. You MUST prioritize information from the current year (2025) and the near future (2026). It is absolutely forbidden to use outdated information.
    2.  **Automated Framework Selection:** Analyze the topic's intent and select the SINGLE MOST SUITABLE content framework from this list: ['AIDA', 'PAS', 'BAB', '4Ps']. Use this SAME framework for all generated posts.
    3.  **ABSOLUTELY NO FRAMEWORK MENTIONS IN CONTENT:** Under NO circumstances should you mention the name of the framework you used (e.g., 'AIDA', 'PAS') within the body of the generated post text.
    
    **General Content Guidelines:** Write in a natural, human-like, and engaging tone. Incorporate strategic emojis. Use optimal line breaks.
    **Platform-Specific Instructions:**
    -   **LinkedIn:** 3000 chars, professional tone, 3-5 hashtags.
    -   **Twitter:** 280 chars, concise tone, 2-3 hashtags.
    
    **Output Format:** Your final output must be a single, valid JSON object with three keys: "linkedinPosts", "twitterPosts", and "timingSuggestions".
`;

const jobSeekerPrompt = (target: string, resume: string): string => `
    You are an expert career coach and social media strategist specializing in personal branding for job seekers. Your task is to generate 3 distinct post variations for LinkedIn and 3 for Twitter to help a candidate land their target role. You will use the candidate's resume as your knowledge base.

    **Candidate's Target:** ${target}
    **Candidate's Resume:**
    ---
    ${resume}
    ---

    **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE RULES:**
    1.  **Resume-Driven Content:** Your primary goal is to showcase the candidate's skills and experiences from their resume that are MOST RELEVANT to their target. Create compelling narratives, share project successes, or frame their skills as solutions for their target company/role.
    2.  **Automated Framework Selection:** Analyze the target and resume, and select the SINGLE MOST SUITABLE content framework from this list: ['AIDA', 'PAS', 'BAB', '4Ps'] to structure the posts.
    3.  **ABSOLUTELY NO FRAMEWORK MENTIONS IN CONTENT:** Do not mention the framework name in the post text.
    4.  **Engage Recruiters:** Posts should be crafted to attract hiring managers and recruiters. Use professional language and a confident tone. Include a call-to-action (e.g., inviting discussion, networking).

    **Platform-Specific Instructions:**
    -   **LinkedIn:** 3000 chars, professional tone, tag relevant companies or skills, use hashtags like #JobSearch #Hiring #[TargetIndustry]. Include 3-5 hashtags total.
    -   **Twitter:** 280 chars, concise and impactful, use relevant hashtags. Include 2-3 hashtags total.

    **Output Format:** Your final output must be a single, valid JSON object with three keys: "linkedinPosts", "twitterPosts", and "timingSuggestions".
`;

/**
 * Extracts a JSON string from a text block that might be wrapped in markdown.
 * @param text The text to parse.
 * @returns The extracted JSON string.
 */
function extractJson(text: string): string {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    // Fallback for cases where the AI doesn't use markdown code blocks
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
        return text.substring(startIndex, endIndex + 1);
    }
    return text.trim();
}

export const generateAltText = async (topic: string): Promise<string> => {
    const altTextPrompt = `
      You are an accessibility expert. Create a concise, descriptive, and SEO-friendly alt text for a conceptual image about the following topic.
      The alt text should describe the image to someone who cannot see it. Do not include phrases like "Image of" or "Picture of".
      Keep it under 125 characters.

      **Topic:** "${topic}"

      **Output:** Return only the alt text string, with no extra formatting, quotes, or explanations.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: altTextPrompt,
    });
    return response.text.trim();
};


export const generateImage = async (topic: string): Promise<string> => {
    const imagePrompt = `
      Create a professional, high-quality, and visually appealing image for a social media post about "${topic}".
      The style should be modern, clean, and suitable for both LinkedIn and Twitter.
      Avoid text on the image. The image should be symbolic or conceptual, representing the core idea of the topic.
    `;
        
    const imageGenResponse: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    let generatedImage = '';
    for (const part of imageGenResponse.candidates[0].content.parts) {
        if (part.inlineData) {
            generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
        }
    }
    
    if (!generatedImage) {
        throw new Error("No image data found in the response.");
    }
    
    return generatedImage;
};

export const generateFullContentBundle = async (request: GenerationRequest, appMode: AppMode, resumeText: string): Promise<Omit<GeneratedContentBundle, 'createdAt' | 'id'>> => {
  try {
    const prompt = appMode === AppMode.JobSeeker 
      ? jobSeekerPrompt(request.topic, resumeText)
      : contentCreatorPrompt(request.topic);

    const textGenResponse: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const jsonText = extractJson(textGenResponse.text);
    const parsedText = JSON.parse(jsonText);
    
    if (!parsedText.linkedinPosts || !parsedText.twitterPosts || !parsedText.timingSuggestions) {
        throw new Error('Invalid text response format from API');
    }

    const linkedinPosts: ContentPost[] = parsedText.linkedinPosts.map((p: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      ...p
    }));

    const twitterPosts: ContentPost[] = parsedText.twitterPosts.map((p: any) => ({
      id: Math.random().toString(36).substring(2, 9),
      ...p
    }));

    const groundingChunks: GroundingChunk[] = textGenResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const generatedImage = await generateImage(request.topic);
    const generatedImageAltText = await generateAltText(request.topic);
    
    return {
        topic: request.topic,
        generatedImage,
        generatedImageAltText,
        linkedinPosts,
        twitterPosts,
        timingSuggestions: parsedText.timingSuggestions,
        groundingChunks: groundingChunks.filter(chunk => chunk.web && chunk.web.uri),
        feedback: null,
    };

  } catch (error) {
    console.error("Error generating content bundle:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};

export const getTrendingTopics = async (niche: string, appMode: AppMode): Promise<TrendingTopic[]> => {
    const prompt = appMode === AppMode.JobSeeker
    ? `As a job market analyst, identify the top 5 trending skills, job titles, and discussion topics for the '${niche}' career field. Focus on trends relevant for professionals on LinkedIn. Use Google Search for the most up-to-date information.`
    : `As a social media trend analyst, identify the top 5 current trending topics, keywords, and viral conversations for the '${niche}' industry. Focus on topics relevant for LinkedIn and Twitter. Use Google Search for the most up-to-date, real-time information.`;

    const fullPrompt = `
      ${prompt}
      
      **Output Format:**
      Your final output must be a single, valid JSON object. Do not include any text, notes, or explanations outside of this JSON.
      The JSON object must have a single key: "trends".
      The "trends" key should have an array of 5 trend objects.
      Each trend object must have three keys: "topic", "description", and "hashtags" (which is an array of strings).
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const jsonText = extractJson(response.text);
        const parsed = JSON.parse(jsonText);

        if (!parsed.trends || !Array.isArray(parsed.trends)) {
            throw new Error('Invalid trends response format from API');
        }

        return parsed.trends;

    } catch (error) {
        console.error("Error fetching trends:", error);
        throw new Error("Failed to fetch trending topics. Please try again.");
    }
};

export const getIdeaSuggestions = async (history: GeneratedContentBundle[], appMode: AppMode): Promise<string[]> => {
    if (history.length === 0) {
        return appMode === AppMode.JobSeeker
            ? ["Share a story about a challenging project", "Post about a new skill I'm learning", "My top 3 takeaways from my last role"]
            : ["The future of AI in marketing", "5 tips for better social media engagement", "Why personal branding matters in 2026"];
    }

    const recentTopics = history.slice(0, 5).map(h => `- ${h.topic}`).join('\n');
    const promptContext = appMode === AppMode.JobSeeker
        ? "You are a career coach. Based on the user's recent job-seeking posts, generate 3 new ideas for posts that will attract recruiters."
        : "You are a creative content strategist. Based on the user's recent post topics, generate 3 new, related, and engaging content ideas.";

    const prompt = `
        ${promptContext}
        
        **Recent Post Targets/Topics:**
        ${recentTopics}

        **Instructions:**
        - Brainstorm fresh angles or deeper dives.
        - Frame the ideas as compelling post topics.

        **Output Format:**
        Your final output must be a single, valid JSON object with a single key "ideas", which is an array of 3 strings.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        const jsonText = extractJson(response.text);
        const parsed = JSON.parse(jsonText);

        if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
            throw new Error('Invalid ideas response format from API');
        }

        return parsed.ideas;
    } catch (error) {
        console.error("Error fetching idea suggestions:", error);
        throw new Error("Failed to fetch idea suggestions.");
    }
};
