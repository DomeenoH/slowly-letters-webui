# 🦅 Slowly Letters: AI-Powered Digitalization & Visualization

> A complete solution to digitize, translate, and visualize your Slowly letter correspondence.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![TypeScript](https://img.shields.io/badge/Simulated_Agent-Active-green)

**English** | [中文](./README.md)

This project is not just a UI; it is a **full-stack digital heritage workflow** for Slowly users. It transforms your static letter backups into a living, searchable, and bilingual digital archive.

## 📁 Project Structure

```
slowly/
├── PenPals/              # Pen pal data storage
│   └── <FriendName>/
│       ├── messages/     # Letter source (Markdown)
│       └── attachments/  # Photo/audio attachments
├── System/               # System config and prompt templates
├── scripts/              # Standalone scripts (scraper, etc.)
└── webui/                # Web visualization interface
    ├── scripts/          # Data processing scripts
    ├── src/              # React frontend source
    └── public/data/      # Generated JSON data
```

## ✨ Features

### 🤖 Intelligent Agent Workflow (`webui/scripts/`)
The core of this project is an automated agentic script (`parse_letters.ts`) that acts as your personal archivist:
- **ETL Processing**: Parses raw Slowly markdown exports into structured JSON data.
- **AI Translation**: Automatically translates English letters to Chinese (or your preferred language) using LLMs (e.g., Qwen 2.5), maintaining the original tone.
- **Media Sync**: Automatically detects, downloads, and archives attached photos and audio from letters to your local machine.
- **Smart Caching**: Caches translations to save API costs and time on subsequent runs.

### 🎨 Modern Web Visualization (`webui/src/`)
A beautiful, responsive web interface to browse your correspondence:
- **Timeline View**: Visualizes your relationship history on an interactive timeline.
- **Bilingual Toggle**: Instantly switch between original and translated content.
- **Media Integration**: View photos and listen to audio clips directly within the letter context.
- **Responsive Design**: Optimized for both desktop and mobile reading.

## 🚀 Quick Start (Out of the Box)

Even if you don't have personal data, you can experience the project immediately with our built-in mock mode.

### 1. Installation
```bash
git clone https://github.com/DomeenoH/slowly-letters.git
cd slowly-letters/webui
npm install
```

### 2. Configuration
Create your environment file.
```bash
cp .env.example .env
```
*Note: If you want to use the AI translation feature with your own data, fill in your `OPENAI_API_KEY` and `OPENAI_BASE_URL` in `.env`.*

### 3. Run the Demo
If you don't have your own data (files in `../PenPals`), the system will automatically generate **Mock Data** for you.

```bash
# Start the visualization
npm run dev
```
Open your browser at `http://localhost:5173`. You will see a demo conversation showing how the timeline and translation features work.

---

## 🔧 Using Your Own Data

To use this with your actual Slowly letters:

1. **Export Data**: Export your letters from Slowly (Markdown format) and place them in the folder structure (e.g., `PenPals/<FriendName>/messages/<FriendName>.md`). *Note: You may need to adjust the `PENPALS_DIR` path in `webui/scripts/parse_letters.ts` to match your directory structure.*
2. **Configure AI**: Ensure your `webui/.env` has a valid API key for translation.
3. **Run the Agent**:
   ```bash
   cd webui
   npx tsx scripts/parse_letters.ts
   ```
   This will:
   - Scan your letters.
   - Call the AI to translate new content.
   - Download any images found in the letters.
   - Generate `public/data/letters.json`.

4. **View**: Run `npm run dev` to see your personal archive.

## 🌐 Batch Scrape Slowly Letters

Slowly does not support letter export. If you want to batch backup all letters with a pen pal, you can use the **browser console script** below.

### Steps

1.  **Open Slowly Web**: Go to [web.slowly.app](https://web.slowly.app) and log in to your account.
2.  **Enter a Letter View**: Navigate to the chat with the pen pal you want to backup, click on any letter to enter the **reading view**.
3.  **Navigate to the First Letter**: Manually navigate to your **very first letter** (the oldest one). This is the **starting point** for the script.
4.  **Open Browser Console**: Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools, then switch to the **"Console"** tab.
5.  **Paste and Run the Script**: Copy the full script from [`scripts/slowly_scraper.js`](./scripts/slowly_scraper.js), paste it into the console, and press `Enter`.

6.  **Wait for Execution**: The script will automatically flip through pages and scrape content. You'll see progress logs in the console.
7.  **Save the Result**: Once finished, the content will be **automatically copied to your clipboard**. Create a new `.md` file (e.g., `PenPals/Kel/messages/Kel.md`) and paste the content to save.

### ⚠️ Notes
- If the network is slow or letters don't load completely, increase `waitDelay` from `2500` to a higher value (e.g., `4000`).
- The script automatically captures **image and audio attachment links** within letters.

---

## 🛡️ Privacy & Security

- **Local First**: All your letter data and images are stored **only on your local machine**; nothing is uploaded to external servers.
- **Safe Open Sourcing**: Your personal data and secrets are automatically excluded via `.gitignore`. You can safely fork and modify the code.

## 📄 License

MIT © DomeenoH
