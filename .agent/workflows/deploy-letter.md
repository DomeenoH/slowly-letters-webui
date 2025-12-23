---
description: 处理新信件并部署到服务器（新收到的信 + 你的回信）
---

# 新信件处理与部署工作流

## 触发条件
用户提供了新信件内容（收到的信或发出的回信），需要归档、翻译并同步到服务器。

## 工作流步骤

### 1. 获取信件信息
向用户确认以下信息：
- **笔友名称**: Kel / Lamine / Moni / 其他
- **信件方向**: 收到的信 (in) 还是发出的回信 (out)
- **信件日期**: 如 2024-12-24
- **信件内容**: 完整文本

### 2. 保存原始信件
将信件追加到对应笔友的 Markdown 文件：
- 路径: `/Volumes/杂项/slowly/PenPals/<笔友名>/messages/<笔友名>.md`
- 格式:
```markdown
---
## <日期> - <方向标记>

<信件内容>

---
```

### 3. 处理附件（如有）
如果信件包含图片/音频附件：
1. 保存到 `/Volumes/杂项/slowly/PenPals/<笔友名>/attachments/`
2. 在信件中添加附件引用

### 4. 运行翻译脚本
// turbo
```bash
cd /Volumes/杂项/slowly/webui && npx tsx scripts/parse_letters.ts
```
这会：
- 解析所有信件
- 翻译新内容（使用缓存避免重复）
- 生成 `public/data/letters.json`

### 5. 构建生产版本
// turbo
```bash
cd /Volumes/杂项/slowly/webui && npm run build
```

### 6. 同步到服务器
```bash
rsync -avz /Volumes/杂项/slowly/webui/dist/ root@u.0x0.cat:/var/www/slowly/
```
密码: `<SSH_PASSWORD>`

### 7. 验证部署
打开 https://b.0x0.cat 确认新信件已显示

---

## 快速模式（仅更新数据，不重新构建）
如果只是添加新信件，无需修改前端代码：
// turbo
```bash
cd /Volumes/杂项/slowly/webui && npx tsx scripts/parse_letters.ts
```
然后只同步 letters.json：
```bash
rsync -avz /Volumes/杂项/slowly/webui/public/data/letters.json root@u.0x0.cat:/var/www/slowly/data/
```

---

## 服务器信息
- **访问地址**: https://b.0x0.cat
- **服务器**: root@u.0x0.cat
- **密码**: <SSH_PASSWORD>
- **部署目录**: /var/www/slowly/
