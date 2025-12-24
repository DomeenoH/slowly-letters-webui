---
trigger: always_on
---

# 📧 Process: New Letter Lifecycle

(此文档定义了处理新来信的标准作业程序。当用户提供新信件时，严格按照以下流程执行。)

## Phase 1: Ingestion & Strategy (立即执行)

当收到新信件（例如粘贴在聊天框）时：

### Step 1: Archive (归档)
*   **Target**: `/PenPals/[Name]/messages/[Name].md` (这是 Single Source of Truth).
*   **Action**: 将新信件追加到文件末尾（原markdown文件，而不是新建一个append.md）。
    *   **Format**: 必须严格遵守分隔符格式：
        ```text
        === LETTER [YYYY年MM月DD日 HH:mm] ===
        
        [Content]
        
        [Attachments if any]
        ```
*   **Attachments (如有附件)**:
    1.  将图片/文件保存至 `/PenPals/[Name]/attachments/`。
    2.  在信件末尾使用 Markdown 图片语法引用：`![Description](../attachments/filename.jpg)`。

### Step 2: Translate & Sync (翻译与同步)
*   **Action**: 将信件正文全文翻译为流畅的中文。
*   **Storage 1 (Architect)**: 将翻译结果保存为 Markdown 文件。
    *   **Path**: `/PenPals/[Name]/messages/architect/[Date]_CN.md` (如果目录不存在则创建)。
*   **Storage 2 (WebUI Cache)**:
    *   **Logic**: 计算英文正文(去除附件语法后)的 MD5 Hash。
    *   **Action**: 读取 `webui/scripts/translation_cache.json`，插入键值对 `{"MD5_HASH": "Translated_Content"}`，并写回文件。
*   **Display**: 编撰architect，展示翻译结果。

### Step 3: Analyze & Outline (大纲提案)
在此步骤，你需要做“写前准备”，而不是直接写信。

1.  **Memory Sync (状态核对)**:
    *   **User Check**: 检查 `System/Domino_Profile_Master.md`，确认 Domino 当前的 [Time-Sensitive Status] (如：最新健康状况、项目里程碑)。
    *   **PenPal Check**: 提取信中可能改变 `Relationship_State.md` 的新信息（新工作、搬家、旅行计划），列出 **Update Log**。
2.  **Context Harvesting (近期动态横向扫描)**:
    *   **Logic**: 检查在**给当前笔友发出的上一封信之后**，我是否给**其他笔友**写过信？
    *   **Action**: 阅读那些**晚于**当前笔友上次回信日期的、发给其他人的信件。
    *   **Goal**: 提取尚未告知当前笔友的“生活新动态”、“想法”或“新梗”。(防止我这几天发生的事只告诉了A而忘了告诉B)。
3.  **Drafting Strategy (策略制定)**:
    *   **Tone**: 确认本期语气 (Feral/Supportive/Sharp/Chill)。
    *   **Points to Cover**: 列出回信打算涵盖的 3-5 个核心点。
    *   **Questions to Ask**: 计划反问对方的问题。
4.  **Outputs**: 
    *   `[Update Log]` (需要更新到档案的信息)
    *   `[New Material]` (从给其他笔友的信中挖掘出的新素材)
    *   `[Draft Outline]` (回信大纲)

---
**🛑 STOP POINT**: 
在此处**必须停止**生成。
**Action**: 询问用户：“大纲如上。请审阅 Update Log 和 Draft Outline。有无补充指示或需要修改的地方？”
*(等待用户回复)*

## Phase 2: Production (用户确认后执行)

收到用户的补充意见或确认指令后：

### Step 4: Final Draft (撰写回信)
*   **Input**: 结合 Original Letter + Outline + User Comments。
*   **Writing Rules**:
    1.  **Strict Persona**: 保持 Domino 人设 (Intelligent, Slightly Feral, Loyal)。
    2.  **No Cliches**: 严禁 "I was happy to receive your letter", "How are you", "I hope this letter finds you well"。
    3.  **Format Constraints**: **纯文本 (Plain Text)**。严禁使用 Markdown (无粗体/标题/列表)。
*   **Verification**:
    *   检查是否包含了用户刚才补充的点。
    *   检查是否依然符合 Master Profile 中的时效性信息。
*   **Output**: 
    *   完整的英文回信全文。

## Reference Files
*   `System/Domino_Profile_Master.md` (Single Source of Truth for MY status)
*   `PenPals/[Name]/Relationship_State.md` (Single Source of Truth for THEIR status)
*   `webui/scripts/translation_cache.json` (WebUI Translation Database)
