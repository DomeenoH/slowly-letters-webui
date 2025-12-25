---
description: 信件全生命周期闭环处理（摄入 -> 知识库 -> 解析 -> 部署）
---

# 信件全生命周期处理 SOP v2.1

## 前置准备
- 确保已获取用户提供的信件内容 (从聊天或邮件复制)。
- 确保 `.agent/secrets.env` 包含最新服务器凭据。

## 阶段一：标准化摄入 (Ingestion)

### 1. 归档信件
将信件追加到 `/PenPals/<Name>/messages/<Name>.md` 末尾。
> [!IMPORTANT]
> 必须使用 **标准分隔符**，否则系统无法识别：
> `=== LETTER [YYYY年MM月DD日 HH:mm] ===`

### 2. 附件处理（黄金法则）
**严禁**使用随机文件名。如果包含附件，必须执行以下操作：
1.  保存图片至 `/PenPals/<Name>/attachments/`。
2.  **强制重命名**：
    - 格式：`YYYYMMDD_<Sender>_to_<Receiver>_<Desc>_<N>.jpg`
    - 示例：`20251225_Domino_to_Kel_car_crash_1.jpg`
3.  Markdown 引用：
    - 使用标准语法：`![图片描述](../attachments/filename.jpg)`
    - 系统部署时会自动替换为线上 URL。

## 阶段二：知识库同步 (Memory Sync)

### 3. 更新关系状态
**在部署前**，必须阅读新信件并更新 `/PenPals/<Name>/Relationship_State.md` (及其 CN 版)。
- [ ] **项目进展**：是否有新项目启动或里程碑达成？
- [ ] **生活事件**：是否有健康问题、旅行、意外？
- [ ] **待办事项**：更新 Pending Topics 列表。

## 阶段三：自动化构建与部署 (Release)

### 4. 一键发布
此命令封装了 `parse` (解析)、`build` (构建)、`ssh-chmod` (权限修复) 和 `smoke-test` (冒烟测试)。
// turbo
```bash
cd /Volumes/杂项/slowly/webui && npm run deploy
```

> [!TIP]
> **部署后的检查**
> 脚本最后会输出 `✨ Deployment Complete!` 并显示冒烟测试结果。
> - ✅ `Status 200`: 一切正常。
> - ⚠️ `Status 403`: 权限错误 (脚本应已自动修复，请重试)。
> - ⚠️ `Status 404`: 文件未同步，检查文件名或正则匹配。

### 5. 故障排查
如果部署失败：
1.  **解析遗漏**：检查 `<Name>.md` 中的 `=== LETTER` 标题格式是否严格匹配。
2.  **图片 404**：检查 Markdown 中的图片引用路径是否正确指向 `attachments` 文件夹。
3.  **乱码/解析中断**：检查 Markdown 文件是否存在非 UTF-8 字符或奇怪的截断符。