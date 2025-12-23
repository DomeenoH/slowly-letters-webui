# 🦅 Slowly Letters: 数字化信件可视化与智能归档方案

> 一个完整的 Slowly 信件数字化、翻译与可视化解决方案。

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![TypeScript](https://img.shields.io/badge/Simulated_Agent-Active-green)

[English](./README_EN.md) | **中文**

这个项目不仅仅是一个 UI 界面，它是一套为 Slowly 用户打造的**全栈数字遗产工作流**。它将你静态的信件备份转化为一个鲜活的、可搜索的、双语对照的数字档案。

## ✨ 核心特性

### 🤖 智能体工作流 (Agentic Workflow) - `/scripts`
项目的核心是一个自动化的智能体脚本 (`parse_letters.ts`)，它就像你的私人档案管理员：
- **ETL 数据处理**: 解析 Slowly 原始的 Markdown 导出文件，转化为结构化的 JSON 数据。
- **AI 智能翻译**: 使用大语言模型（如 Qwen 2.5）自动将英文信件翻译为中文，保持原本的语气和情感。
- **媒体同步**: 自动检测信件中的图片和音频附件，并将其下载归档到本地。
- **智能缓存**: 缓存已翻译的内容，避免重复消耗 API 额度和时间。

### 🎨 现代化 Web 可视化 (Web Visualization) - `/src`
一个精美、响应式的网页界面，用于浏览你的信件历史：
- **时间轴视图**: 在交互式时间轴上回顾你们的书信往来历史。
- **双语对照**: 一键在原文和译文之间切换。
- **媒体集成**: 直接在信件内容中查看图片和播放音频。
- **响应式设计**: 完美适配桌面端和移动端阅读。

## 🚀 快速开始 (开箱即用)

即使你没有自己的数据，也可以通过内置的模拟模式立即体验项目功能。

### 1. 安装
```bash
git clone https://github.com/DomeenoH/slowly-letters-webui.git
cd slowly-letters-webui
npm install
```

### 2. 配置
复制环境变量模版。
```bash
cp .env.example .env
```
*注：如果你想配合自己的数据使用 AI 翻译功能，请在 `.env` 中填入你的 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`。*

### 3. 运行演示
如果你没有自己的数据（即 `../PenPals` 目录为空），系统会自动为你生成 **Mock Data**（模拟数据）。

```bash
# 启动可视化界面
npm run dev
```
浏览器打开 `http://localhost:5173`。你将看到一个演示对话，展示了时间轴和翻译功能是如何工作的。

---

## 🔧 使用你自己的数据

如果你想导入真实的 Slowly 信件：

1. **导出数据**: 从 Slowly 导出信件（Markdown 格式），并按照一定的目录结构放置在本项目同级目录中（例如 `../PenPals/<笔友名>/messages/<笔友名>.md`）。
   *注意：你可能需要调整 `scripts/parse_letters.ts` 中的 `PENPALS_DIR` 路径以匹配你的实际目录结构。*
2. **配置 AI**: 确保 `.env` 中填写了有效的 API Key 用于翻译。
3. **运行智能体**:
   ```bash
   npx tsx scripts/parse_letters.ts
   ```
   该脚本将会：
   - 扫描你的信件。
   - 调用 AI 翻译新内容。
   - 下载信件中包含的图片。
   - 生成 `public/data/letters.json`。

4. **查看**: 运行 `npm run dev` 即可浏览你的个人信件档案。

## 🌐 批量爬取 Slowly 信件

Slowly 官方不支持信件导出，如果你想批量备份与某位笔友的所有信件，可以使用下面的**浏览器控制台脚本**。

### 使用步骤

1.  **打开 Slowly Web 版**: 前往 [web.slowly.app](https://web.slowly.app) 并登录你的账号。
2.  **进入信件页面**: 进入你想备份的笔友的聊天界面，点击任意一封信件进入**阅读视图**。
3.  **定位到最早一封信**: 手动点击你们的**第一封信**（最早的那封）。这是脚本的**起点**。
4.  **打开浏览器控制台**: 按 `F12` (或 `Cmd+Option+I` on Mac) 打开开发者工具，切换到 **"Console" (控制台)** 标签页。
5.  **粘贴并运行脚本**: 复制 [`scripts/slowly_scraper.js`](./scripts/slowly_scraper.js) 的完整内容，粘贴到控制台中，按 `Enter` 执行。

6.  **等待脚本执行**: 脚本会自动翻页并抓取，你会在控制台看到进度日志。
7.  **保存结果**: 脚本完成后，内容会**自动复制到剪贴板**。新建一个 `.md` 文件（如 `PenPals/Kel/messages/Kel.md`），粘贴保存即可。

### ⚠️ 注意事项
- 如果网络较慢或信件加载不完整，可将 `waitDelay` 从 `2500` 调大（如 `4000`）。
- 脚本会自动抓取信件内的**图片和音频附件链接**。

---

## 🛡️ 隐私与安全

- **本地优先**: 所有信件数据和图片都**只存储在你的本地机器上**，不会上传至任何外部服务器。
- **安全开源**: 你的个人数据和密钥通过 `.gitignore` 自动排除，可放心 Fork 和修改代码。

## 📄 许可证

MIT © DomeenoH
