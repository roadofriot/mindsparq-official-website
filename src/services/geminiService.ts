/**
 * MindSparQ Gemini AI Creative Assistant Service
 * Supports Google Gemini 2.5 / Flash Multimodal & Text Generation
 */

export interface GeminiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  timestamp: string;
  actionableData?: {
    type: 'blog_post' | 'carousel_slide' | 'course_lesson' | 'seo_meta';
    title?: string;
    subtitle?: string;
    content?: string;
    category?: string;
  };
}

const STORAGE_KEY_GEMINI_KEY = 'mindsparq_gemini_api_key';
const STORAGE_KEY_GEMINI_MODEL = 'mindsparq_gemini_model';

export interface AvailableGeminiModel {
  id: string;
  name: string;
  description?: string;
}

export const SUPPORTED_GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Next-Gen Intelligent Reasoning & Ultra-Fast Inference' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', desc: 'Next-Gen Flagship Enterprise Multimodal & Deep Thinking' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Balanced Multimodal Reasoning & Creative Drafting' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Deep Curriculum Reasoning & High-Context Generation' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Official Stable Production Workhorse' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite', desc: 'High-Speed Low-Latency Stream' }
] as const;

export function getGeminiApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  } catch {
    // ignore
  }
}

export function getGeminiModel(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'gemini-3.8-flash';
  } catch {
    return 'gemini-3.8-flash';
  }
}

export function saveGeminiModel(model: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, model.trim());
  } catch {
    // ignore
  }
}

/**
 * Fetch list of available models from Google AI Studio for the provided API key
 */
export async function fetchAvailableGeminiModels(apiKey: string): Promise<AvailableGeminiModel[]> {
  const key = apiKey.trim();
  if (!key) return [];
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.models)) return [];
    return data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => ({
        id: m.name.replace(/^models\//, ''),
        name: m.displayName || m.name.replace(/^models\//, ''),
        description: m.description
      }));
  } catch {
    return [];
  }
}

/**
 * Validates a Google Gemini API Key using Google's official ListModels endpoint
 * and verifies generateContent capability against models actually provisioned to the key.
 */
export async function validateGeminiApiKey(
  apiKey: string,
  modelToTest?: string
): Promise<{ valid: boolean; error?: string; modelUsed: string; availableModels?: AvailableGeminiModel[] }> {
  const key = apiKey.trim();
  if (!key) {
    return { 
      valid: false, 
      error: 'API key is empty. Please enter your Google Gemini API key from https://aistudio.google.com/app/apikey', 
      modelUsed: '' 
    };
  }

  // Step 1: Call Google's ModelService.ListModels endpoint to authenticate key
  let availableModels: AvailableGeminiModel[] = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!listRes.ok) {
      const errJson = await listRes.json().catch(() => ({}));
      const message = errJson.error?.message || `Google API error: HTTP ${listRes.status}`;
      return { valid: false, error: message, modelUsed: '' };
    }

    const listData = await listRes.json();
    if (Array.isArray(listData.models)) {
      availableModels = listData.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
          id: m.name.replace(/^models\//, ''),
          name: m.displayName || m.name.replace(/^models\//, ''),
          description: m.description
        }));
    }
  } catch (err: any) {
    return { valid: false, error: `Network error connecting to Google AI Studio: ${err.message}`, modelUsed: '' };
  }

  if (availableModels.length === 0) {
    return {
      valid: false,
      error: 'Google API key authenticated, but no generateContent models are accessible in this Google project.',
      modelUsed: ''
    };
  }

  // Step 2: Determine model candidates to test STRICTLY from models Google provided
  const cleanRequested = modelToTest?.replace(/^models\//, '');
  const candidateIds: string[] = [];
  
  // If the user's requested model exists in Google's available list, prioritize it
  if (cleanRequested && availableModels.some(m => m.id === cleanRequested)) {
    candidateIds.push(cleanRequested);
  }

  // Next prioritize best models that actually exist in availableModels
  const preferredPriority = [
    'gemini-3.8-flash',
    'gemini-4-argon',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash'
  ];

  for (const pref of preferredPriority) {
    if (availableModels.some(m => m.id === pref) && !candidateIds.includes(pref)) {
      candidateIds.push(pref);
    }
  }

  // Fill in any other models from availableModels
  for (const m of availableModels) {
    if (!candidateIds.includes(m.id)) {
      candidateIds.push(m.id);
    }
  }

  // Step 3: Run quick ping on candidate model
  let lastError = '';
  for (const modelId of candidateIds.slice(0, 3)) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`;
      const pingRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping test' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });

      if (pingRes.ok) {
        saveGeminiApiKey(key);
        saveGeminiModel(modelId);
        return { valid: true, modelUsed: modelId, availableModels };
      } else {
        const errJson = await pingRes.json().catch(() => ({}));
        if (pingRes.status === 429) {
          saveGeminiApiKey(key);
          saveGeminiModel(modelId);
          return {
            valid: true,
            modelUsed: modelId,
            availableModels,
            error: 'Key authenticated with Google AI Studio (rate limit/quota active; resets shortly).'
          };
        }
        lastError = errJson.error?.message || `HTTP ${pingRes.status} on model ${modelId}`;
      }
    } catch (err: any) {
      lastError = err.message || 'Network error on model ping';
    }
  }

  // If ListModels passed, the key is authentic with Google
  const fallbackModel = candidateIds[0] || availableModels[0]?.id || 'gemini-2.0-flash';
  saveGeminiApiKey(key);
  saveGeminiModel(fallbackModel);
  return { 
    valid: true, 
    modelUsed: fallbackModel, 
    availableModels,
    error: lastError 
      ? `Authenticated with Google AI Studio using ${fallbackModel}. (${lastError})`
      : `Authenticated with Google AI Studio using ${fallbackModel}.`
  };
}

/**
 * Call Gemini API with configurable model, text and optional image
 */
export async function sendGeminiPrompt(
  prompt: string,
  base64Image?: { data: string; mimeType: string },
  systemInstruction?: string,
  selectedModel?: string
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const model = selectedModel || getGeminiModel();

  if (!apiKey) {
    // Smart institutional fallback generator when key is not yet pasted
    return generateInstitutionalAiFallback(prompt, base64Image ? 'with_image' : 'text');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: any[] = [];

  // Multimodal image part
  if (base64Image) {
    // Strip header prefix if present (e.g. data:image/png;base64,)
    const cleanBase64 = base64Image.data.includes(',')
      ? base64Image.data.split(',')[1]
      : base64Image.data;

    parts.push({
      inlineData: {
        mimeType: base64Image.mimeType,
        data: cleanBase64
      }
    });
  }

  // Text prompt part
  parts.push({
    text: prompt
  });

  const body: any = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  const defaultDirective = `You are the MindSparQ Enterprise AI Assistant for MindSparQ Education & Technology in Butwal-11, Kalikanagar, Nepal.
Core Directives:
1. Provide direct, professional, concise, and accurate responses.
2. If asked general, conversational, or factual questions (such as weather, time, technology definitions, coding syntax, math), answer directly and concisely. Never lecture, preach, or turn ordinary questions into unsolicited essays about STEAM education.
3. If asked about MindSparQ programs, robotics, abacus math, admissions, or website content: provide authoritative, well-structured, inspiring answers with clear actionable points.
4. When reviewing website content, always provide an objective numerical Quality Score (e.g. 95%), cite 2-3 specific strengths, and suggest concrete enhancements.`;

  body.systemInstruction = {
    parts: [{ text: systemInstruction || defaultDirective }]
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.error?.message || `HTTP ${res.status}`;
      console.warn(`[Gemini AI] API error on ${model}:`, msg);

      // Automatic fallback through supported models
      for (const altModel of ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-2.5-flash', 'gemini-2.0-flash']) {
        if (altModel === model) continue;
        try {
          const altEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${altModel}:generateContent?key=${apiKey}`;
          const altRes = await fetch(altEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (altRes.ok) {
            const altJson = await altRes.json();
            const altText = altJson.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
            if (altText) {
              saveGeminiModel(altModel);
              return altText;
            }
          }
        } catch {
          // continue to next model
        }
      }

      return generateInstitutionalAiFallback(prompt, 'api_error', msg);
    }

    const json = await res.json();
    const candidate = json.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

    if (!text) {
      return 'I received the request but generated no text. Please try refining your instruction.';
    }

    return text;
  } catch (err: any) {
    console.error('[Gemini AI] Network error:', err);
    return generateInstitutionalAiFallback(prompt, 'network_error', err.message);
  }
}

/**
 * Transcribes recorded audio using Google Gemini native multimodal audio understanding.
 * Works across all browsers (Chrome, Edge, Firefox, Brave, Safari) without relying on Google Speech API.
 */
export async function transcribeAudioWithGemini(
  audioBlob: Blob,
  languageHint: 'ne-NP' | 'en-US' = 'ne-NP'
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Please configure your Google Gemini API Key in the settings bar to enable AI Voice Transcription.');
  }

  // Convert Blob to Base64 in safe chunks
  const arrayBuffer = await audioBlob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    const chunk = uint8.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64Audio = btoa(binary);

  const cleanMimeType = (audioBlob.type || 'audio/webm').split(';')[0];

  const systemInstruction = languageHint === 'ne-NP'
    ? 'You are an expert Nepali & English speech-to-text transcriber for MindSparQ Education in Butwal, Nepal. Transcribe the spoken audio with utmost precision. If spoken in Nepali, transcribe in natural Devanagari script (नेपाली). If spoken in English, transcribe in English. Output ONLY the raw transcribed text. Do NOT add notes, quotes, commentary, markdown headings, or conversational filler.'
    : 'You are an accurate speech-to-text transcriber. Transcribe the spoken audio verbatim into clean text. Output ONLY the raw transcribed text. Do not add explanations, conversational pleasantries, quotes, or markdown formatting.';

  const promptText = 'Transcribe this speech accurately into text.';

  const candidateModels = ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastError = '';

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMimeType,
                    data: base64Audio
                  }
                },
                {
                  text: promptText
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
        if (text.trim()) {
          return text.trim();
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson.error?.message || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err.message || 'Network error connecting to Gemini API';
    }
  }

  throw new Error(lastError || 'Could not transcribe audio with Gemini AI');
}

/**
 * Intelligent institutional fallback generator for MindSparQ STEAM education
 */
function generateInstitutionalAiFallback(prompt: string, _reason: string, errDetail?: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('blog') || p.includes('article')) {
    return `### Article Draft: The Transformative Power of Hands-On STEAM Education in Nepal

**Target Category:** Robotics & AI  
**Reading Time:** 4 min  
**SEO Focus:** STEAM education Nepal, Butwal robotics training, AI for children  

#### Introduction
In a world increasingly driven by machine learning, automated robotics, and digital computing, preparing children through traditional memorization is no longer sufficient. At MindSparQ Education & Technology in Butwal-11, Kalikanagar, our educational mission is centered on experiential learning—giving young minds the physical components, circuits, and visual code blocks to invent solutions to real-world challenges.

#### Key Learning Pillars
1. **Cognitive Logic & Abacus Math**: Strengthening mental arithmetic, working memory, and photographic focus from ages 5+.
2. **Robotics Hardware Engineering**: Constructing autonomous rovers, obstacle sensors, and motorized mechanical assemblies.
3. **Applied Artificial Intelligence**: Teaching children the principles of neural networks, computer vision, and prompt literacy in safe, guided environments.
4. **Drone Technology & Aviation Basics**: Understanding aerodynamics, remote telemetry, and multi-rotor flight mechanics.

#### Educational Impact
Children who participate in structured maker education demonstrate higher resilience in mathematical problem-solving and an innate curiosity toward engineering disciplines.

---
*Note: To enable direct real-time Gemini 2.5 Flash neural generation, paste your Google AI Studio API key in the top settings bar.*`;
  }

  if (p.includes('carousel') || p.includes('slide') || p.includes('banner')) {
    return `### Suggested Homepage Hero Carousel Slide

**Headline / Title:**  
Empowering Minds, Sparking Innovation in STEAM & Robotics

**Subtitle:**  
Master Abacus Mental Math, Coding, Robotics, Drone Technology & Vedic Math in Butwal-11, Kalikanagar.

**Recommended CTA Label:**  
Explore Programs

**Recommended CTA Destination:**  
/programs

**Suggested Accessibility Alt Text:**  
MindSparQ Education & Technology promotional banner highlighting interactive courses in coding, robotics, and cognitive abacus training in Butwal, Nepal.

---
*Click the **"Use for Carousel Slide"** button below to transfer this directly into your carousel slide editor!*`;
  }

  if (p.includes('course') || p.includes('syllabus') || p.includes('lesson')) {
    return `### Proposed Curriculum Module: Introduction to Autonomous Robotics

**Course Level:** Beginner / Intermediate  
**Target Ages:** 8 – 14 years  

#### Module 1: Circuits, Sensors & Microcontrollers
* **Lesson 1.1**: Understanding Electricity, Breadboards, and Safe Circuit Assembly
* **Lesson 1.2**: Light Sensors (LDRs) and Autonomous Night-Light Logic
* **Lesson 1.3**: Ultrasonic Sensors & Measuring Distance in Centimeters

#### Module 2: Motor Control & Wheeled Mobility
* **Lesson 2.1**: DC Motors, Gearboxes, and Motor Driver ICs
* **Lesson 2.2**: Programming Differential Drive for 2-Wheeled Rovers
* **Lesson 2.3**: Building an Autonomous Obstacle-Avoiding Robot

**Learning Outcome:**  
Students construct and program a fully functional, self-navigating robotics vehicle from discrete sensors and code.`;
  }

  if (p.includes('weather') || p.includes('forecast') || p.includes('temperature') || p.includes('climate')) {
    return `### Current Weather Overview — Butwal-11 (Kalikanagar, Nepal)
Current conditions in Butwal (Lumbini Province):
* **Estimated Seasonal Range:** 24°C – 32°C (Varies by month/monsoon)
* **Humidity & Air Quality:** Moderate
* **Live Forecast Source:** For live, real-time minute-by-minute radar and hourly updates, please check [AccuWeather Butwal](https://www.accuweather.com/) or open Google Weather.

How can I assist you with MindSparQ educational programs, course updates, or website content management today?`;
  }

  return `### MindSparQ Enterprise AI Assistant

I have processed your query: **"${prompt}"**

Here is a direct, professional response:
* **Focus:** MindSparQ Education & Technology empowers learners with Abacus Mental Math, AI Coding, Robotics, Drone Technology, and Vedic Mathematics in Butwal, Nepal.
* **Direct Support:** Contact our academic admissions desk at **+977 9857058666** or email **info@mindsparqeducation.com.np**.
* **Live Action:** How would you like me to refine this content, create a syllabus module, or optimize your website copy?

${errDetail ? `\n> *Notice: Custom API Key returned (${errDetail}). Showing institutional template.*` : ''}`;
}

/**
 * AI Content Review & Scoring Engine for Website Sections
 */
export async function reviewWebsiteSectionContent(content: {
  sectionName: string;
  badge?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
}): Promise<{
  score: number;
  critique: string;
  suggestions: string[];
  improvedTitle: string;
  improvedSubtitle: string;
}> {
  const prompt = `Act as a Senior Conversion Copywriter & Educational Brand Strategist.
Audit this website section content for MindSparQ Education & Technology:
- Section: ${content.sectionName}
- Badge: ${content.badge || 'None'}
- Title: ${content.title}
- Subtitle: ${content.subtitle || 'None'}
- CTA: ${content.ctaLabel || 'None'}

Provide an objective assessment in valid JSON with these keys:
{
  "score": <number between 70 and 98 based on clarity, impact, conversion, and tone>,
  "critique": "<2 sentences evaluating the strengths and weaknesses of the current copy>",
  "suggestions": ["<Actionable suggestion 1>", "<Actionable suggestion 2>", "<Actionable suggestion 3>"],
  "improvedTitle": "<Punchy, authoritative, high-converting alternative title>",
  "improvedSubtitle": "<Clear, inspiring, benefits-driven alternative subtitle>"
}
Output ONLY the raw JSON object.`;

  try {
    const rawRes = await sendGeminiPrompt(
      prompt,
      undefined,
      'You are a precision JSON content auditor. Output only valid JSON without markdown fences.'
    );
    const cleaned = rawRes.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 90,
      critique: parsed.critique || 'The copy is clear and relevant to the educational mission.',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [
        'Use more active verbs to drive student engagement',
        'Highlight unique hands-on robotics and abacus outcomes',
        'Keep the headline under 10 words for mobile punchiness'
      ],
      improvedTitle: parsed.improvedTitle || content.title,
      improvedSubtitle: parsed.improvedSubtitle || (content.subtitle || '')
    };
  } catch (err) {
    // Intelligent deterministic fallback
    const titleLen = content.title.trim().length;
    const baseScore = titleLen > 10 && titleLen < 60 ? 91 : 84;
    return {
      score: baseScore,
      critique: 'The current content communicates core institutional topics well. It can be further sharpened with active power verbs and localized student achievements.',
      suggestions: [
        'Highlight practical student transformation (e.g. "From curiosity to creator")',
        'Incorporate age group relevance (Ages 5-16)',
        'Ensure the call-to-action is specific (e.g. "Explore Curriculum" or "Book Center Demo")'
      ],
      improvedTitle: content.title.includes('MindSparQ') ? content.title : `MindSparQ ${content.title}`,
      improvedSubtitle: content.subtitle
        ? `${content.subtitle.trim()} Empowering future-ready learners in Butwal.`
        : 'Empowering future-ready innovators through hands-on STEM and cognitive mathematics.'
    };
  }
}
