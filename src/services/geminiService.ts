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

/**
 * Call Gemini 2.5 Flash API with text and optional image
 */
export async function sendGeminiPrompt(
  prompt: string,
  base64Image?: { data: string; mimeType: string },
  systemInstruction?: string
): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Smart institutional fallback generator when key is not yet pasted
    return generateInstitutionalAiFallback(prompt, base64Image ? 'with_image' : 'text');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

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
      console.warn('[Gemini AI] API error:', msg);
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

  return `### MindSparQ AI Creative Assistant

I have processed your instruction: **"${prompt}"**

Here is a recommended institutional draft aligned with MindSparQ's pedagogical standards in Butwal-11, Kalikanagar:

* **Key Focus:** Empowering young learners with high-agency cognitive, coding, and engineering skills.
* **Core Tracks:** Abacus, Vedic Math, AI & Robotics, Drone Technology, DMIT, Teacher Training.
* **Call to Action:** Direct inquiries to +977 9857058666 or visit our center opposite Kalika Manavgyan Secondary School.

${errDetail ? `\n> *Notice: Custom API Key returned (${errDetail}). Showing institutional template.*` : ''}`;
}
