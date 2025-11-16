export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// --- Topper Note Section Types ---
export interface NoteExample {
  type: 'Simple' | 'Standard';
  content: string;
}

export interface PastQuestion {
  type: '1 Mark' | '2-3 Marks' | '5 Marks' | 'Assertion-Reason' | 'MCQ' | 'Distinguish/Compare' | 'Give Reason';
  question: string;
  answer: string;
}

export interface TopperNoteSection {
  title: string;
  definition: string;
  keyFormulas?: { title: string, content: string[] };
  examples?: NoteExample[];
  diagram?: { imageQuery: string; labels: string[] };
  pyqs?: PastQuestion[];
  commonMistakes?: string[];
  topicSummary: string[];
  imageDataUrl?: string; // For diagram
}

// --- Chapter End Sections ---
export interface GiveReasonQuestion {
  question: string;
  answer: string;
}

export interface DistinguishItem {
  feature: string;
  itemA: string;
  itemB: string;
}

export interface FormulaItem {
  formula: string;
  variables: string;
  example: string;
}

export interface ReactionItem {
  reaction: string;
  details: string;
}

// --- Main Notes Structure ---
export interface InteractiveNotes {
  title: string;
  // Front Page
  weightage: string;
  pyqHeadlines: string[];
  highRiskTopics: string[];
  mindMapImageQuery: string;
  mindMapImageDataUrl?: string;
  // Core Content
  sections: TopperNoteSection[];
  // End Sections
  giveReasonBank?: GiveReasonQuestion[];
  distinguishBank?: { topicA: string; topicB: string; items: DistinguishItem[] }[];
  formulaSheet?: FormulaItem[];
  reactionBank?: ReactionItem[];
  // Legacy fields for revision page compatibility
  summary: string;
  quiz: QuizQuestion[];
  learningPath: LearningPath;
}


// --- Legacy & General Types ---

// FIX: Exported KeyVocabulary type for use in Flashcards and MindMapExplanation components.
export interface KeyVocabulary {
  term: string;
  definition: string;
}

// FIX: Exported ModelDescription type for use in InteractiveModel component.
export interface ModelDescription {
    description: string;
    components: {
        name: string;
        description: string;
    }[];
}

// FIX: Exported InteractiveDiagram type for use in InteractiveDiagram component.
export interface InteractiveDiagram {
    description: string;
    imageQuery: string;
    hotspots: {
        x: number;
        y: number;
        label: string;
        description: string;
    }[];
}


export interface Node {
  id: string;
  label: string;
}

export interface Edge {
  from: string;
  to: string;
}

export interface LearningPath {
  nodes: Node[];
  edges: Edge[];
}

export type Theme = 'abyss' | 'paper' | 'cyberpunk';

// --- Mind Map specific types ---
export interface MindMapNode extends Node {
    x: number;
    y: number;
    vx?: number; // velocity x
    vy?: number; // velocity y
    isRoot?: boolean;
    isUserGenerated?: boolean;
    isExpanded: boolean;
    children: MindMapNode[];
    parent?: string;
    level: number;
}

export interface MindMapEdge extends Edge {
    id: string;
}

// --- Compatibility types for old components ---
export interface NoteSection {
  title: string;
  // FIX: Added optional title to contentBlocks and updated keyVocabulary to use the exported type, fixing type errors.
  contentBlocks: { title?: string, items: string[] }[];
  keyVocabulary?: KeyVocabulary[];
  eli5?: string;
  knowledgeCheck?: QuizQuestion;
}
