---
description: 信件全生命周期闭环处理（摄入 -> 知识库 -> 解析 -> 部署）
---

# 信件全生命周期处理 SOP v2.0

此工作流替代旧的 `deploy-letter`，引入了更严格的命名规范、知识库同步要求和防御性部署机制。

## 前置准备
- 确保已获取用户提供的信件内容。
- 确保 `.agent/secrets.env` 包含最新服务器凭据。

## 阶段一：标准化摄入 (Ingestion)

### 1. 归档信件
将信件追加到 `/PenPals/<Name>/messages/<Name>.md`。
- **格式要求**：
```markdown
---
=== LETTER [YYYY年MM月DD日 HH:mm] ===

<正文内容>

[图1] ../attachments/YYYYMMDD_Sender_to_Receiver_desc_1.jpg
[图2] ../attachments/YYYYMMDD_Sender_to_Receiver_desc_2.jpg

---
```

### 2. 附件处理（黄金法则）
**严禁**使用随机文件名。如果包含附件，必须执行以下操作：
1.  保存图片至 `/PenPals/<Name>/attachments/`。
2.  **强制重命名**：
    - 格式：`YYYYMMDD_<Sender>_to_<Receiver>_<Desc>_<N>.jpg`
    - 示例：`20251225_Domino_to_Kel_car_crash_1.jpg`
3.  确保 Markdown 中的引用路径准确指向改名后的文件。

## 阶段二：知识库同步 (Memory Sync)

### 3. 更新关系状态
**在部署前**，必须阅读新信件并更新 `/PenPals/<Name>/Relationship_State.md` (及其 CN 版)。
- [ ] **项目进展**：是否有新项目启动或里程碑达成？
- [ ] **生活事件**：是否有健康问题、旅行、意外？
- [ ] **待办事项**：更新 Pending Topics 列表。

## 阶段三：自动化构建 (Build)

### 4. 运行解析与翻译
此步骤会自动处理附件路径、生成翻译并更新 `letters.json`。
// turbo
```bash
cd /Volumes/杂项/slowly/webui && npx tsx scripts/parse_letters.ts
```

### 5. 构建前端
// turbo
```bash
cd /Volumes/杂项/slowly/webui && npm run build
```

## 阶段四：防御性部署 (Defensive Deployment)

### 6. 原子化同步
使用 `rsync` 部署，并**强制修复权限** (755/644)，防止 Nginx 403 错误。
// turbo
```bash
cd /Volumes/杂项/slowly/webui && source ../.agent/secrets.env && rsync -avz --chmod=D755,F644 dist/ $SSH_HOST:$DEPLOY_PATH
```

### 7. 冒烟测试 (Smoke Test)
验证最新的一张图片是否可以访问 (替换 URL 为实际图片地址)。
```bash
curl -I <PUBLIC_URL>/images/letters/<Name>/<Latest_Image_Name.jpg>
```
如果返回 `HTTP/2 200`，则部署成功。
