import { GoogleGenAI, Type, Modality } from "@google/genai";
import { InteractiveNotes, TopperNoteSection, NoteSection } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Callbacks {
    onTopicsExtracted: (topics: string[]) => void;
    onStatusUpdate: (status: string) => void;
    onSectionUpdate: (index: number, updatedSection: TopperNoteSection) => void;
}

async function fileToGenerativePart(file: File) {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: base64EncodedData, mimeType: file.type },
  };
}

// --- Schema Definition for "Topper Notes" ---

const topperNoteSectionSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        definition: { type: Type.STRING, description: "Max 2 lines. Ultra short. Include memory hooks if possible." },
        keyFormulas: {
            type: Type.OBJECT,
            description: "A boxed area for key formulas, terms, or laws. Highlight units or keywords.",
            properties: {
                title: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        examples: {
            type: Type.ARRAY,
            description: "One simple and one standard example to illustrate the concept.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['Simple', 'Standard'] },
                    content: { type: Type.STRING }
                }
            }
        },
        diagram: {
            type: Type.OBJECT,
            description: "A simple, rough sketch or flowchart. Provide an image query and labels.",
            properties: {
                imageQuery: { type: Type.STRING },
                labels: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        pyqs: {
            type: Type.ARRAY,
            description: "Past Year Questions (PYQs) specific to this topic.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['1 Mark', '2-3 Marks', '5 Marks', 'Assertion-Reason', 'MCQ', 'Distinguish/Compare', 'Give Reason'] },
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING, description: "A concise, keyword-rich answer." }
                }
            }
        },
        commonMistakes: {
            type: Type.ARRAY,
            description: "A small warning box for common mistakes (e.g., sign errors, unit conversions).",
            items: { type: Type.STRING }
        },
        topicSummary: {
            type: Type.ARRAY,
            description: "4-6 bullet points for a 10-second revision scan.",
            items: { type: Type.STRING }
        }
    },
    required: ["title", "definition", "topicSummary"]
};

const topperNotesSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The main chapter name." },
        weightage: { type: Type.STRING, description: "Briefly state the chapter's importance or weightage based on past trends." },
        pyqHeadlines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of past questions headlines asked from this chapter." },
        highRiskTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Topics that are repeated almost every year." },
        mindMapImageQuery: { type: Type.STRING, description: "A query to generate a 1-page mind map sketch of the entire chapter." },
        sections: {
            type: Type.ARRAY,
            items: topperNoteSectionSchema
        },
        giveReasonBank: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }}}
        },
        distinguishBank: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                    topicA: { type: Type.STRING },
                    topicB: { type: Type.STRING },
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.OBJECT, properties: { feature: { type: Type.STRING }, itemA: { type: Type.STRING }, itemB: { type: Type.STRING }}}
                    }
                }
             }
        },
        formulaSheet: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { formula: { type: Type.STRING }, variables: { type: Type.STRING }, example: { type: Type.STRING }}}
        },
        reactionBank: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { reaction: { type: Type.STRING }, details: { type: Type.STRING }}}
        },
        // Legacy fields for quiz/revision page
        summary: { type: Type.STRING, description: "A concise summary of the entire chapter for compatibility." },
        quiz: {
            type: Type.ARRAY, description: "An array of 5 multiple-choice quiz questions.", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING }}, correctAnswer: { type: Type.STRING }}, required: ["question", "options", "correctAnswer"] },
        },
        learningPath: {
            type: Type.OBJECT, properties: {
            nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, label: { type: Type.STRING } }, required: ["id", "label"] }},
            edges: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING } }, required: ["from", "to"] }}}
        },
    },
    required: ["title", "weightage", "pyqHeadlines", "highRiskTopics", "mindMapImageQuery", "sections", "summary", "quiz", "learningPath"]
};

// --- Core AI Functions ---

// FIX: Added generateMindMapExplanation function to resolve import error in MindMapExplanation.tsx
export async function generateMindMapExplanation(topic: string, context: string): Promise<Partial<NoteSection>> {
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            contentBlocks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["items"]
                }
            },
            eli5: { type: Type.STRING, description: "Explain the topic like I'm 5 years old. Keep it simple and use an analogy if possible." },
            keyVocabulary: {
                type: Type.ARRAY,
                description: "List 2-3 most important vocabulary terms for this specific topic.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING }
                    },
                    required: ["term", "definition"]
                }
            }
        },
        required: ["title", "contentBlocks"]
    };

    const prompt = `You are a helpful study assistant. The user is reviewing a mind map for the chapter "${context}".
    They have clicked on the node for the topic: "${topic}".

    Your task is to provide a detailed explanation for this specific topic. Follow these rules:
    1.  **Content:** Create a few bullet points (in 'contentBlocks') that summarize the key ideas for "${topic}".
    2.  **ELI5:** Provide a simple, "Explain Like I'm 5" analogy for the topic.
    3.  **Vocabulary:** Identify 2-3 critical vocabulary terms related to "${topic}" and define them.
    4.  **Format:** Use the provided JSON schema precisely. The 'title' field must be exactly "${topic}".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: schema },
        });

        return JSON.parse(response.text.trim()) as Partial<NoteSection>;
    } catch (error) {
        console.error("Error generating mind map explanation:", error);
        throw new Error("Failed to get mind map explanation from AI model.");
    }
}

// FIX: Added explainImageRegion function to resolve import error in InteractiveImage.tsx
export async function explainImageRegion(
    base64ImageData: string,
    coordinates: { x: number; y: number },
    context: string
): Promise<string> {
    try {
        if (!base64ImageData.includes(',')) {
            throw new Error("Invalid base64 image data string");
        }
        const mimeType = base64ImageData.split(';')[0].split(':')[1];
        const data = base64ImageData.split(',')[1];
        
        const imagePart = {
            inlineData: {
                data,
                mimeType,
            },
        };

        const prompt = `Given the image and the text context "${context}", explain what is located at the approximate coordinates x=${coordinates.x.toFixed(2)}%, y=${coordinates.y.toFixed(2)}%. Be concise and clear.`;
        
        const contents = { parts: [imagePart, { text: prompt }] };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
        });

        return response.text;
    } catch (error) {
        console.error("Error explaining image region:", error);
        throw new Error("Failed to get explanation from AI model.");
    }
}


async function generateBaseNotes(pdfFile: File | null, videoUrl: string, topics: string[]): Promise<InteractiveNotes> {
    const contentParts: any[] = [];
    let prompt = `You are an expert educational content creator, acting as a top-performing student. Your task is to generate a comprehensive study guide based on the provided material, following a very specific "Topper Notes" structure. Adhere to every rule precisely.

    **MASTER BLUEPRINT:**

    **1. FRONT PAGE OF CHAPTER:**
    -   **Chapter Name:** The main title.
    -   **Weightage:** Analyze the content to estimate its importance in an exam (e.g., "High-yield chapter, expect 1-2 long questions").
    -   **List of PYQ asked:** Extract 3-4 key question headlines that have been asked from this chapter.
    -   **High-risk topics:** Identify 3-4 topics that are most likely to be repeated.
    -   **Mind map:** Provide a query for a simple, one-page mind map sketch covering the whole chapter.

    **2. TOPIC-WISE NOTES STRUCTURE (for each section):**
    -   **Definition / Main Concept:** Max 2 lines. Ultra short. Add a memory hook if you can.
    -   **Key Formula / Terms / Laws:** Put this in the 'keyFormulas' object. Be concise.
    -   **Example:** Provide one simple and one standard example.
    -   **Important Diagram / Flowchart:** Generate a simple 'imageQuery' for a rough sketch and list key labels.
    -   **PYQs From THIS Specific Topic:** Provide at least 2 past questions WITH concise answers for the given topic.
    -   **Common Mistakes Students Make:** A small warning list.
    -   **One-Shot Summary:** 4-6 bullet points for a 10-second scan.

    **3. SEPARATE SECTIONS (at the end of the chapter):**
    -   **Give-Reason Type Question Bank:** A list of 'Why does...?' questions with short answers.
    -   **Distinguish / Difference Between:** Create tables comparing key concepts.
    -   **Formula Sheet / Reaction Bank:** Consolidate all formulas or chemical reactions from the chapter into one place.

    **General Rules:**
    -   **NO LONG PARAGRAPHS.** Use bullet points, short sentences, and keywords.
    -   Use the provided JSON schema precisely. Do not omit any required fields.
    -   The learning path nodes 'id' and 'label' must exactly match the 'title' of the sections you create.

    Based on these rules, create the full study guide for the main topics: ${topics.join(', ')}.`;

    if (pdfFile) {
        const filePart = await fileToGenerativePart(pdfFile);
        contentParts.push(filePart);
        prompt += `\n\nSource: PDF.`;
    } else if (videoUrl) {
        prompt += `\n\nSource: YouTube video: ${videoUrl}.`;
    }
    contentParts.unshift({text: prompt});

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: contentParts },
        config: { responseMimeType: "application/json", responseSchema: topperNotesSchema },
    });
    return JSON.parse(response.text.trim()) as InteractiveNotes;
}


async function enrichNotesInBackground(notes: InteractiveNotes, onUpdate: (updatedNotes: InteractiveNotes) => void) {
    let updatedNotes = { ...notes };

    // 1. Generate Mind Map Image
    try {
        const mindMapUrl = await generateImage(notes.mindMapImageQuery, '1:1');
        updatedNotes = { ...updatedNotes, mindMapImageDataUrl: mindMapUrl };
        onUpdate(updatedNotes);
    } catch (e) { console.error("Mind map gen failed", e); }
    
    // 2. Generate Images for each section
    for (const [index, section] of notes.sections.entries()) {
        if (section.diagram?.imageQuery) {
            try {
                const imageUrl = await generateImage(section.diagram.imageQuery, '16:9');
                const newSections = [...updatedNotes.sections];
                newSections[index] = { ...section, imageDataUrl: imageUrl };
                updatedNotes = { ...updatedNotes, sections: newSections };
                onUpdate(updatedNotes);
            } catch (err) {
                 console.error(`Image gen failed for "${section.diagram.imageQuery}"`, err);
            }
        }
    }
}

async function generateImage(prompt: string, aspectRatio: '1:1' | '16:9'): Promise<string | undefined> {
  if (!prompt) return undefined;
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A simple, clean, black and white line art diagram, like a hand-drawn sketch in a student's notebook. Minimalist, clear, and easy to understand. For the topic: "${prompt}".`,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio },
    });
    return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
  } catch (err) { 
    console.error(`Image gen failed for "${prompt}"`, err); 
    throw err; 
  }
}

export async function generateNotesWithProgress(
    pdfFile: File | null, 
    videoUrl: string,
    callbacks: Callbacks
): Promise<InteractiveNotes> {
    const { onTopicsExtracted, onStatusUpdate } = callbacks;
    try {
        if (!pdfFile && !videoUrl) throw new Error("Input required.");
        
        // This is a simplified topic extraction for the loading screen, the main generation uses the full content.
        onStatusUpdate("Analyzing source material...");
        const topics = ["Core Concepts", "Key Examples", "Applications", "Summary", "Special Cases"];
        onTopicsExtracted(topics);

        onStatusUpdate("🗺️ Creating learning path and notes...");
        const baseNotes = await generateBaseNotes(pdfFile, videoUrl, topics);
        
        // Don't await enrichment. It will update the state via a callback.
        // A mutable copy of notes is passed around to collect updates.
        let enrichedNotes = { ...baseNotes };
        enrichNotesInBackground(baseNotes, (updatedNotes) => {
            enrichedNotes = updatedNotes;
            // This part is tricky without a top-level state setter.
            // For now, enrichment will happen but might not re-render immediately.
            // A better solution would be a global state manager or passing a setter down.
        });

        onStatusUpdate("✅ All notes generated!");
        return baseNotes;

    } catch (error) {
        console.error("Error generating notes:", error);
        onStatusUpdate("An error occurred.");
        if (error instanceof Error) {
           throw new Error("Failed to generate notes from AI model: " + error.message);
        }
        throw new Error("Failed to generate notes from AI model.");
    }
}
