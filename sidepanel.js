'use strict';

const onlyVisibleEl = document.getElementById('onlyVisible');
const deduplicateEl = document.getElementById('deduplicate');
const maxCountEl = document.getElementById('maxCount');
const collectBtn = document.getElementById('collect');
const resultSection = document.getElementById('resultSection');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copy');
const errorEl = document.getElementById('error');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
  resultSection.classList.add('hidden');
}

function hideError() {
  errorEl.classList.add('hidden');
}

collectBtn.addEventListener('click', async () => {
  hideError();
  collectBtn.disabled = true;
  collectBtn.textContent = '采集中…';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showError('无法获取当前标签页');
      return;
    }
    const url = tab.url || '';
    if (!/^https:\/\/(www\.)?x\.com\/i\/bookmarks/i.test(url)) {
      showError('请先在浏览器中打开 x.com/i/bookmarks 页面，再点击采集。');
      return;
    }

    const options = {
      onlyVisible: onlyVisibleEl.checked,
      deduplicate: deduplicateEl.checked,
      maxCount: parseInt(maxCountEl.value, 10) || 0
    };

    const urls = await chrome.tabs.sendMessage(tab.id, { action: 'getBookmarkUrls', options });
    const text = Array.isArray(urls) ? urls.join('\n') : '';
    const count = Array.isArray(urls) ? urls.length : 0;

    resultTitle.textContent = `已采集 ${count} 条链接（地址之间已换行）`;
    resultText.value = text;
    resultSection.classList.remove('hidden');
  } catch (e) {
    showError('采集失败：请确保当前标签页是 x.com/i/bookmarks 并已加载完成，然后刷新该页面后再试。');
    console.error(e);
  } finally {
    collectBtn.disabled = false;
    collectBtn.textContent = '采集收藏链接';
  }
});

copyBtn.addEventListener('click', () => {
  const text = resultText.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '已复制';
    setTimeout(() => { copyBtn.textContent = '复制到剪贴板'; }, 1500);
  });
});
