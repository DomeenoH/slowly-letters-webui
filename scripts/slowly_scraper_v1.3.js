/**
 * Slowly Letter Auto-Scraper (v1.3 Media Plus)
 * 核心功能：
 * 1. 自动提取每封信的精准日期和时间。
 * 2. 自动抓取并列出信件中包含的所有图片附件（高清原图链接）。
 * 3. 自动抓取录音附件（.aac 下载链接）。
 * 4. 防死循环：检测到内容重复时自动停止，避免在第一封/最后一封信处打转。
 * 5. 自动复制：抓取完成后内容自动保存到系统剪贴板。
 */

const CONFIG = {
    textSelector: ".pre-wrap.mb-3",
    nextButtonSelector: "a.no-underline.link.py-2.px-3.mx-1",
    imageSelector: "img.img-thumbnail",
    audioSelector: "a.btn.text-primary:has(.icon-download)",
    // 提取信件顶部的地理位置和时间容器
    timeContainerSelector: "p:has(i.icon-pin)",
    waitDelay: 2500, // 适度延迟确保媒体内容加载完成
    maxCount: 200    // 最大抓取数量限制
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function startScraping() {
    console.log("%c🚀 Slowly Scraper v1.3 Media Plus 启动...", "color: #ff9800; font-weight: bold; font-size: 1.2em;");
    let collectedLetters = [];
    let seenContent = new Set();
    let pageCount = 0;

    while (pageCount < CONFIG.maxCount) {
        // 等待页面初步稳定
        await sleep(1000);

        // 1. 抓取正文
        const contentEl = document.querySelector(CONFIG.textSelector);
        if (!contentEl) {
            console.warn("⚠️ 无法定位正文选择器，可能页面已跳转或未加载。正在尝试终止...");
            break;
        }

        const bodyText = contentEl.innerText.trim();
        // 取前100个字符作为指纹，确保重复判断的准确性
        const contentFingerprint = bodyText.substring(0, 100);

        // 🛑 重复性熔断机制
        if (seenContent.has(contentFingerprint)) {
            console.log("%c🛑 检测到内容与之前重复，可能是到达终点或翻页异常，任务优雅结束。", "color: #f44336; font-weight: bold;");
            break;
        }
        seenContent.add(contentFingerprint);

        // 2. 抓取时间 (精准匹配 p 标签内的文本第一行)
        const timeEl = document.querySelector(CONFIG.timeContainerSelector);
        let dateLine = "未知日期";
        if (timeEl) {
            // 通过获取元素的内部文本并按行分割，取第一行通常即为日期时间
            dateLine = timeEl.innerText.split('\n')[0].trim();
        }

        // 3. 抓取媒体附件 (深度提取)
        let mediaInfo = "";

        // 图片附件提取
        const imgs = document.querySelectorAll(CONFIG.imageSelector);
        if (imgs.length > 0) {
            mediaInfo += "\n📸 图片附件:";
            imgs.forEach((img, idx) => {
                // 自动捕获 src 链接
                mediaInfo += `\n   [图${idx + 1}] ${img.src}`;
            });
        }

        // 录音附件提取
        const audios = document.querySelectorAll(CONFIG.audioSelector);
        if (audios.length > 0) {
            mediaInfo += "\n🎵 录音附件:";
            audios.forEach((audio, idx) => {
                // 捕获 a 标签的 href 链接
                mediaInfo += `\n   [音频${idx + 1}] ${audio.href}`;
            });
        }

        // 4. 构建单封信内容
        const fullText = `\n=== LETTER ${pageCount + 1} [${dateLine}] ===\n\n${bodyText}\n${mediaInfo ? mediaInfo + "\n" : ""}`;
        collectedLetters.push(fullText);
        console.log(`%c✅ 已处理第 ${pageCount + 1} 封信: ${dateLine}`, "color: #4caf50;");

        // 5. 翻页动作执行 (从旧往新：使用左箭头)
        const nextBtn = document.querySelector(`${CONFIG.nextButtonSelector}:has(.icon-chevron-left)`);

        if (nextBtn) {
            nextBtn.click();
            pageCount++;
            // 关键：等待内容翻转和图片重载
            await sleep(CONFIG.waitDelay);
        } else {
            console.log("%c🛑 未能发现“上一封(向左)”按钮(icon-chevron-left)，任务结束。", "color: #ff9800;");
            break;
        }
    }

    // 6. 最终汇总结算
    const finalOutput = collectedLetters.join("\n" + "—".repeat(50) + "\n");
    console.log(`\n%c🎉 抓取任务圆满完成！共捕获 ${collectedLetters.length} 封信件。`, "color: #2196f3; font-weight: bold; font-size: 1.1em;");

    try {
        await navigator.clipboard.writeText(finalOutput);
        console.log("%c📋 万美！全文已复制到您的剪贴板，可直接粘贴。/ᐠ. ｡.ᐟ\\ᵐᵉᵒʷˎˊ˗", "color: #9c27b0;");
    } catch (e) {
        console.log("%c❌ 剪贴板自动写入受阻，请直接在控制台执行: copy(finalOutput) 进行手动复制。", "color: #ff5722;");
        console.log(finalOutput);
    }
}

// 启动执行
startScraping();
