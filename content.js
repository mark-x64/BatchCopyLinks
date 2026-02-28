(function () {
  'use strict';

  // ── 平台检测 ────────────────────────────────────────────────────────
  const host = location.hostname;
  const isTwitter   = /^(www\.)?x\.com$/.test(host);
  const isInstagram = /^(www\.)?instagram\.com$/.test(host);
  if (!isTwitter && !isInstagram) return;

  // ════════════════════════════════════════════════════════════════════
  //  TWITTER
  // ════════════════════════════════════════════════════════════════════

  function parseTwitterUrl(href) {
    try {
      const u = new URL(href, location.href);
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('status');
      if (idx < 0) return null;
      const username = idx > 0 ? parts[idx - 1] : '';
      const statusId = parts[idx + 1] || '';
      if (!statusId) return null;
      return { username, statusId };
    } catch (_) { return null; }
  }

  function detectTwitterType(article) {
    const nested = article.querySelector('article');
    const ok = (el) => !nested || !nested.contains(el);

    if (Array.from(article.querySelectorAll('a[href*="/i/article/"]')).some(ok))
      return 'article';
    if (Array.from(article.querySelectorAll(
      '[data-testid="cardPoll"],[data-testid*="pollOption"],[data-testid*="PollOption"]'
    )).some(ok)) return 'poll';

    const photos    = Array.from(article.querySelectorAll('[data-testid="tweetPhoto"]')).filter(ok);
    const hasVideo  = Array.from(article.querySelectorAll(
      '[data-testid="videoComponent"],[data-testid="videoPlayer"],video'
    )).some(ok);
    const hasGif    = hasVideo && Array.from(article.querySelectorAll('span,div'))
      .filter(ok).some((el) => el.children.length === 0 && el.textContent.trim() === 'GIF');

    if (hasGif)                        return 'gif';
    if (hasVideo && photos.length > 0) return 'mixed';
    if (hasVideo)                      return 'video';
    if (photos.length > 1)             return 'multi-photo';
    if (photos.length === 1)           return 'photo';
    return 'text';
  }

  function collectTwitterItems() {
    const best = new Map();

    // 主路径：article 元素（可获得类型信息）
    for (const article of document.querySelectorAll('article[data-testid="tweet"]')) {
      const timeEl = article.querySelector('a[href*="/status/"] time');
      if (!timeEl) continue;
      const a = timeEl.closest('a[href*="/status/"]');
      if (!a) continue;
      const parsed = parseTwitterUrl(a.href);
      if (!parsed) continue;
      const link = `https://x.com/${parsed.username}/status/${parsed.statusId}`;
      if (!best.has(link)) {
        best.set(link, {
          username: parsed.username,
          link,
          type: detectTwitterType(article),
        });
      }
    }

    // 兜底：纯链接扫描
    for (const a of document.querySelectorAll('a[href*="/status/"]')) {
      const parsed = parseTwitterUrl(a.href || '');
      if (!parsed) continue;
      const link = `https://x.com/${parsed.username}/status/${parsed.statusId}`;
      if (!best.has(link)) {
        best.set(link, { username: parsed.username, link, type: 'unknown' });
      }
    }

    return Array.from(best.values());
  }

  // ════════════════════════════════════════════════════════════════════
  //  INSTAGRAM
  // ════════════════════════════════════════════════════════════════════

  // Instagram 已知的非用户名路径前缀，用于从链接中区分用户名
  const IG_RESERVED = new Set([
    'p', 'reel', 'tv', 'stories', 'explore', 'accounts', 'reels', 'direct',
    'inbox', 'activity', 'notifications', 'i', 'web', 'ar', 'about', 'legal',
    'privacy', 'terms', 'help', 'create', 'lite', 'challenge',
  ]);

  function parseIgUrl(href) {
    try {
      const u = new URL(href, location.href);
      const parts = u.pathname.split('/').filter(Boolean);
      // 支持 /p/CODE/、/reel/CODE/、/tv/CODE/
      const seg  = parts[0]; // 'p' | 'reel' | 'tv'
      const code = parts[1];
      if (!seg || !code || !['p', 'reel', 'tv'].includes(seg)) return null;
      return { seg, code };
    } catch (_) { return null; }
  }

  // 从 article 里提取第一个出现的用户名（/username/ 格式的链接）
  function extractIgUsername(article) {
    for (const link of article.querySelectorAll('a[href^="/"]')) {
      const path = (link.getAttribute('href') || '').replace(/[?#].*$/, '');
      const m = path.match(/^\/([A-Za-z0-9._]+)\/?$/);
      if (m && !IG_RESERVED.has(m[1])) return m[1];
    }
    return '';
  }

  // Feed 型帖子（article 内）的类型检测
  function detectIgFeedType(article, seg) {
    if (seg === 'reel') return 'reel';

    // 轮播：多个分页圆点（._acnb 是 Instagram 轮播点的稳定短类名）
    const dots = article.querySelectorAll('._acnb');
    if (dots.length > 1) return 'carousel';

    // 轮播兜底：ul > li 数量（排除宽度为 1px 的占位 li）
    const mediaUl = article.querySelector('ul');
    if (mediaUl) {
      const slides = Array.from(mediaUl.querySelectorAll('li')).filter(
        (li) => !(li.getAttribute('style') || '').includes('width:1px')
      );
      if (slides.length > 1) return 'carousel';
    }

    if (article.querySelector('video')) return 'video';
    return 'photo';
  }

  // 网格卡片（Profile / Explore 等）的类型检测
  // 这类卡片有 <svg aria-label> 图标直接标注类型，比 Feed 更好识别
  function detectIgGridType(a, seg) {
    if (seg === 'reel') return 'reel';

    // SVG aria-label 包含类型信息，跨语言匹配关键词
    const svg = a.querySelector('svg[aria-label]');
    if (svg) {
      const label = (svg.getAttribute('aria-label') || '').toLowerCase();
      // 轮播：carousel / 轮播 / 輪播 / カルーセル / 슬라이드 ...
      if (/carousel|轮播|輪播|カルーセル|슬라이드/.test(label)) return 'carousel';
      // 视频：video / 视频 / 動画 / reel / reels / clip ...
      if (/video|视频|動画|reel|clip/.test(label))               return 'video';
    }

    if (a.querySelector('video')) return 'video';
    return 'photo';
  }

  // 仅在纯 Profile 页（/username/）时才能从 URL 推断帖子作者；
  // /username/saved/、/explore/ 等页面无法确定原作者，返回空字符串
  function igPageUsername() {
    const m = location.pathname.match(/^\/([A-Za-z0-9._]+)\/?$/);
    return (m && !IG_RESERVED.has(m[1])) ? m[1] : '';
  }

  function collectInstagramItems() {
    const best = new Map();

    // ① Feed 型帖子：article 内含 <time> 的时间戳链接（与 Twitter 逻辑一致）
    for (const article of document.querySelectorAll('article')) {
      const timeEl = article.querySelector(
        'a[href*="/p/"] time, a[href*="/reel/"] time, a[href*="/tv/"] time'
      );
      if (!timeEl) continue;
      const a = timeEl.closest('a');
      if (!a) continue;
      const parsed = parseIgUrl(a.getAttribute('href') || '');
      if (!parsed) continue;

      const link = `https://www.instagram.com/${parsed.seg}/${parsed.code}/`;
      if (!best.has(link)) {
        best.set(link, {
          username: extractIgUsername(article),
          link,
          type: detectIgFeedType(article, parsed.seg),
        });
      }
    }

    // ② 网格缩略卡：<a href="/p/..."> 包含 img 或 video 的媒体卡片
    //    适用于 Profile、Explore、话题标签、Saved 等各种网格视图
    //
    //    不再依赖 ._aagu（仅 Explore 使用），改为检查 img/video（更通用）
    //    不排除 article 内的链接——① 已先入 best，best.has() 去重即可
    const pageUser = igPageUsername();
    for (const a of document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')) {
      if (!a.querySelector('img, video')) continue;  // 必须包含媒体
      const parsed = parseIgUrl(a.getAttribute('href') || '');
      if (!parsed) continue;

      const link = `https://www.instagram.com/${parsed.seg}/${parsed.code}/`;
      if (best.has(link)) continue;  // ① 已处理或重复，跳过

      best.set(link, {
        username: pageUser,
        link,
        type: detectIgGridType(a, parsed.seg),
      });
    }

    return Array.from(best.values());
  }

  // ════════════════════════════════════════════════════════════════════
  //  共用：采集分发 & 通信层
  // ════════════════════════════════════════════════════════════════════

  function collectItems() {
    return isTwitter ? collectTwitterItems() : collectInstagramItems();
  }

  let timerId      = null;
  let currentPort  = null;
  // 持久累积：懒加载会销毁滚出视口的 DOM，每次扫描结果合并进来，不丢失
  let accumulated  = null;

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'x-tweets-collect') return;
    if (timerId) clearInterval(timerId);
    currentPort = port;

    port.onMessage.addListener((msg) => {
      if (msg.action === 'start') {
        if (timerId) clearInterval(timerId);
        accumulated = new Map();                          // key = canonical link
        const send = () => {
          for (const it of collectItems()) {
            if (!accumulated.has(it.link)) accumulated.set(it.link, it);
          }
          try {
            port.postMessage({ type: 'update', items: Array.from(accumulated.values()) });
          } catch (_) {}
        };
        send();
        timerId = setInterval(send, 1000);

      } else if (msg.action === 'stop') {
        if (timerId) clearInterval(timerId);
        timerId = null;
        const list = accumulated ? Array.from(accumulated.values()) : [];
        try { port.postMessage({ type: 'done', items: list }); } catch (_) {}
      }
    });

    port.onDisconnect.addListener(() => {
      if (timerId) clearInterval(timerId);
      timerId = null;
      currentPort = null;
      accumulated = null;
    });
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action !== 'getTweetUrls') return;
    try { sendResponse(collectItems().map((x) => x.link)); } catch (e) { sendResponse([]); }
    return true;
  });
})();
