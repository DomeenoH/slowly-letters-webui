export type Letter = {
    id: string;
    penPal: string;
    date: string;
    timestamp: number;
    direction: "in" | "out";
    content: string;
    translatedContent?: string; // For the translation feature
    attachments: string[];
    wordCount: number;
};

export const MODELS_VERSION = "1.1.0";
