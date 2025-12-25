import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- Interfaces ---
interface Letter {
    id: string;
    penPal: string;
    date: string;
    timestamp: number;
    direction: "in" | "out";
    content: string; // Markdown content
    translatedContent?: string; // Optional translated content
    attachments: string[]; // URLs (Local paths preferred)
    wordCount: number;
}

// --- Configuration ---
import dotenv from 'dotenv';
dotenv.config();

const PENPALS_DIR = path.resolve(process.cwd(), '../PenPals');
const OUTPUT_FILE = path.resolve(process.cwd(), 'public/data/letters.json');
const CACHE_FILE = path.resolve(process.cwd(), 'scripts/translation_cache.json');
const PUBLIC_IMG_BASE = path.resolve(process.cwd(), 'public/images/letters');

// User provided:
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.hybgzs.com/v1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.warn("⚠️  WARNING: OPENAI_API_KEY not found in .env file.");
    console.warn("    Translation features will be disabled or return empty strings.");
}

// Using Qwen/Qwen2.5-72B-Instruct as selected
const MODEL_NAME = "Qwen/Qwen2.5-72B-Instruct";

// --- Cache Handling ---
let translationCache: Record<string, string> = {};
if (fs.existsSync(CACHE_FILE)) {
    try {
        translationCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch (e) {
        console.error("Failed to load translation cache, starting fresh.");
    }
}

const saveCache = () => {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(translationCache, null, 2));
};

const getCacheKey = (text: string) => {
    return crypto.createHash('md5').update(text).digest('hex');
};

// --- Helper Functions ---
const parseDate = (dateStr: string): number => {
    const cnMatch = dateStr.match(/(\d+)年(\d+)月(\d+)日\s+(\d+):(\d+)/);
    if (cnMatch) {
        const [_, year, month, day, hour, minute] = cnMatch;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
        ).getTime();
    }
    return new Date(dateStr.replace(' at ', ' ')).getTime();
};

const formatDateForFilename = (timestamp: number): string => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
};

const downloadFile = async (url: string, destPath: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
};

const syncAttachment = async (
    url: string,
    penPalName: string,
    timestamp: number,
    direction: "in" | "out",
    index: number
): Promise<string | null> => {
    try {
        // 1. Determine Sender/Receiver
        const sender = direction === "out" ? "Domino" : penPalName;
        const receiver = direction === "out" ? penPalName : "Domino";

        // 2. Determine Filename
        const dateStr = formatDateForFilename(timestamp);

        // Extract extension
        let ext = ".jpg";
        if (url.startsWith('http')) {
            const urlObj = new URL(url);
            ext = path.extname(urlObj.pathname);
        } else {
            ext = path.extname(url);
        }
        if (!ext || ext.length > 5) ext = ".jpg";

        const filename = `${dateStr}_${sender}_to_${receiver}_img${index}${ext}`
            .replace(/\s+/g, '_')
            .replace(/\//g, '-');

        // 3. Define Paths
        const penPalBaseDir = path.join(PENPALS_DIR, penPalName);
        const archiveDir = path.join(penPalBaseDir, 'attachments');
        const publicDir = path.join(PUBLIC_IMG_BASE, penPalName);
        const messagesDir = path.join(penPalBaseDir, 'messages');

        // Ensure directories exist
        if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

        const archivePath = path.join(archiveDir, filename);
        const publicPath = path.join(publicDir, filename);

        // 4. Source handling
        if (url.startsWith('http')) {
            if (!fs.existsSync(archivePath)) {
                console.log(`Downloading new attachment: ${filename}`);
                try {
                    await downloadFile(url, archivePath);
                } catch (dlErr) {
                    console.error(`Download failed for ${url}:`, dlErr);
                    return null;
                }
            }
        } else {
            // Local path - could be relative to messagesDir
            const localSource = path.resolve(messagesDir, url);
            if (fs.existsSync(localSource)) {
                // If the file exists at the source but not at archive, copy it (standardizing name)
                if (!fs.existsSync(archivePath)) {
                    // Check if it's already in the archive folder with the SAME name
                    const alreadyInArchive = path.resolve(archiveDir, path.basename(url));
                    if (alreadyInArchive === archivePath) {
                        // Already named correctly and in archive
                    } else {
                        console.log(`Copying local attachment to archive: ${filename}`);
                        fs.copyFileSync(localSource, archivePath);
                    }
                }
            } else {
                console.error(`Local attachment not found: ${localSource}`);
                return null;
            }
        }

        // 5. Sync to Public (WebUI accessible)
        // If it's already in archive (either by download or copy), ensure it's in public
        if (fs.existsSync(archivePath) && !fs.existsSync(publicPath)) {
            fs.copyFileSync(archivePath, publicPath);
        }

        // Final check
        if (fs.existsSync(publicPath)) {
            return `/images/letters/${penPalName}/${filename}`;
        }
        return null;

    } catch (e) {
        console.error(`Failed to sync attachment ${url}:`, e);
        return null;
    }
};

// --- Translation API ---
async function translateText(text: string): Promise<string> {
    const key = getCacheKey(text);
    if (translationCache[key]) {
        return translationCache[key];
    }

    console.log(`Translating chunk (${text.length} chars) with ${MODEL_NAME}...`);

    const systemPrompt = `You are a professional translator. Translate the following English letter content into warm, natural, and elegant Simplified Chinese. Maintain the original tone and emotion. Return ONLY the translated Chinese text, no explanations.`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                temperature: 0.3
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text();
            console.error(`AI API Error (${response.status}):`, errText);
            return "";
        }

        const data: any = await response.json();
        const translated = data?.choices?.[0]?.message?.content || "";

        if (translated) {
            translationCache[key] = translated;
            saveCache(); // Incremental save
            return translated;
        } else {
            console.warn("AI returned empty content.");
            return "";
        }

    } catch (e: any) {
        if (e.name === 'AbortError') {
            console.error("AI Request timed out (60s).");
        } else {
            console.error("AI Request failed:", e);
        }
        return "";
    }
}

// --- Core Processing ---
const processPenPal = async (name: string): Promise<Letter[]> => {
    const messagesDir = path.join(PENPALS_DIR, name, 'messages');
    const mdFile = path.join(messagesDir, `${name}.md`);

    if (!fs.existsSync(mdFile)) {
        console.warn(`No messages file found for ${name}`);
        return [];
    }

    const content = fs.readFileSync(mdFile, 'utf-8');
    const letters: Letter[] = [];

    const letterRegex = /=== LETTER(?:\s+\d+)?\s*\[(.*?)\] ===\s*\n([\s\S]*?)(?=\n\s*=== LETTER|\n\s*[—\-]{10,}|$)/g;

    let match;
    let count = 0;

    while ((match = letterRegex.exec(content)) !== null) {
        console.log(`Found letter: ${match[1]}`); // DEBUG LOG
        count++;
        const dateStr = match[1];
        let rawBody = match[2].trim();
        const fullMatchBody = match[2]; // Keep original for context checks if needed

        // 1. Determine Direction
        let direction: "in" | "out" = "in";
        if (
            rawBody.match(/Best,\s*\n*Domino/i) ||
            rawBody.match(/Domino\s*$/) ||
            rawBody.match(/Domino\s+\!\[/m) || // Domino followed by image
            rawBody.match(/À bientôt,\s*\n*Domino/i)
        ) {
            direction = "out";
        }

        const timestamp = parseDate(dateStr);

        // 2. Extract Attachments
        const attachmentMatches = [...fullMatchBody.matchAll(/!\[.*?\]\((.*?)\)|\[(图|音频)\d+\]\s*([^ \n]+)/g)];
        const urls = new Set<string>();

        for (const m of attachmentMatches) {
            if (m[1]) urls.add(m[1]); // Markdown image URL
            if (m[3]) urls.add(m[3]); // Scraper format URL / Local path
        }

        // 3. Sync/Download Attachments
        const localAttachments: string[] = [];
        let imgIndex = 0;
        for (const url of urls) {
            imgIndex++;
            const localPath = await syncAttachment(url, name, timestamp, direction, imgIndex);
            if (localPath) {
                localAttachments.push(localPath);
                // Replace in body
                rawBody = rawBody.split(url).join(localPath);
            } else {
                localAttachments.push(url); // Fallback to remote
            }
        }

        // 4. Clean Body
        rawBody = rawBody.replace(/[—\-_]{10,}/g, '').trim();
        rawBody = rawBody.replace(/📸 媒体附件:[\s\S]*?(\n\n|\n-{5,}|$)/, '$1').trim();
        rawBody = rawBody.replace(/^\[图\d+\]\s*https?:\/\/\S+$/gm, '').trim();

        // 5. Translate
        let translatedContent: string | undefined = undefined;
        if (rawBody.length > 0) {
            translatedContent = await translateText(rawBody);
        }

        letters.push({
            id: `${name}-${count}`,
            penPal: name,
            date: dateStr,
            timestamp,
            direction,
            content: rawBody,
            translatedContent,
            attachments: localAttachments,
            wordCount: rawBody.length
        });
    }

    return letters;
};

// --- Main ---
const run = async () => {
    const penPals = ['Kel', 'Lamine', 'Moni'];
    let allLetters: Letter[] = [];

    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load existing letters if we want to merge? 
    // For now, full rebuild is safer to ensure consistency, 
    // but we save incrementally to avoid data loss on crash.

    for (const name of penPals) {
        console.log(`Processing ${name}...`);
        const result = await processPenPal(name);
        allLetters = allLetters.concat(result);

        // Sort and Save incrementally
        allLetters.sort((a, b) => b.timestamp - a.timestamp);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allLetters, null, 2));
        console.log(`Saved ${allLetters.length} letters (after ${name}).`);
    }

    saveCache();
    console.log(`Successfully parsed ${allLetters.length} letters with translations to ${OUTPUT_FILE}`);
};

run().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
