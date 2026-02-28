'use strict';

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const collectActions = document.getElementById('collectActions');
const stopActions = document.getElementById('stopActions');
const scrollHint = document.getElementById('scrollHint');
const resultSection = document.getElementById('resultSection');
const resultTitle = document.getElementById('resultTitle');
const filterBar = document.getElementById('filterBar');
const filterChips = document.getElementById('filterChips');
const itemList = document.getElementById('itemList');
const copyBtn = document.getElementById('copyBtn');
const errorEl = document.getElementById('error');

const TYPE_LABELS = {
  // Twitter
  text: '纯文字',
  photo: '单图',
  'multi-photo': '多图',
  video: '视频',
  gif: 'GIF',
  mixed: '图+视频',
  poll: '投票',
  article: '长文',
  // Instagram
  reel: 'Reel',
  carousel: '轮播',
  // 通用
  unknown: '其他',
};

let port = null;
let allItems = [];
// activeFilters 为空 = 显示全部；否则只显示集合内的类型
let activeFilters = new Set();

function filteredItems() {
  if (activeFilters.size === 0) return allItems;
  return allItems.filter((it) => activeFilters.has(it.type));
}

function renderFilters() {
  const counts = {};
  for (const it of allItems) {
    counts[it.type] = (counts[it.type] || 0) + 1;
  }
  const types = Object.keys(counts);

  // 只有一种类型时不显示筛选栏
  if (types.length <= 1) {
    filterBar.classList.add('hidden');
    return;
  }
  filterBar.classList.remove('hidden');
  filterChips.innerHTML = '';

  // 「全部」chip
  const allChip = document.createElement('span');
  allChip.className = 'filter-chip' + (activeFilters.size === 0 ? ' active' : '');
  allChip.textContent = `全部 (${allItems.length})`;
  allChip.addEventListener('click', () => {
    activeFilters.clear();
    renderFilters();
    renderList();
  });
  filterChips.appendChild(allChip);

  // 各类型 chip（按 TYPE_LABELS 定义顺序排列）
  const orderedTypes = Object.keys(TYPE_LABELS).filter((t) => counts[t] !== undefined);
  const remaining = types.filter((t) => !orderedTypes.includes(t));
  for (const type of [...orderedTypes, ...remaining]) {
    const chip = document.createElement('span');
    chip.className = 'filter-chip' + (activeFilters.has(type) ? ' active' : '');
    chip.textContent = `${TYPE_LABELS[type] || type} (${counts[type]})`;
    chip.addEventListener('click', () => {
      if (activeFilters.has(type)) {
        activeFilters.delete(type);
      } else {
        activeFilters.add(type);
      }
      // 如果所有类型都被选中，等同于全选，重置为「全部」状态
      if (activeFilters.size === types.length) activeFilters.clear();
      renderFilters();
      renderList();
    });
    filterChips.appendChild(chip);
  }
}

function renderList() {
  const items = filteredItems();
  resultTitle.textContent = activeFilters.size === 0
    ? `已采集 ${allItems.length} 条`
    : `已筛选 ${items.length} / ${allItems.length} 条`;

  itemList.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'item-row';

    const badge = document.createElement('span');
    badge.className = `type-badge type-${item.type}`;
    badge.textContent = TYPE_LABELS[item.type] || item.type;

    const userSpan = document.createElement('span');
    userSpan.className = 'username';
    userSpan.textContent = item.username ? `@${item.username}` : '';

    const linkSpan = document.createElement('span');
    linkSpan.className = 'link-secondary';
    linkSpan.textContent = item.link;

    div.append(badge, ' ', userSpan, ' ', linkSpan);
    itemList.appendChild(div);
  });
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

function hideError() {
  errorEl.classList.add('hidden');
}

function setCollecting(collecting) {
  if (collecting) {
    collectActions.classList.add('hidden');
    scrollHint.classList.remove('hidden');
    stopActions.classList.remove('hidden');
    resultSection.classList.remove('hidden');
    allItems = [];
    activeFilters.clear();
    filterBar.classList.add('hidden');
    renderList();
  } else {
    collectActions.classList.remove('hidden');
    scrollHint.classList.add('hidden');
    stopActions.classList.add('hidden');
  }
}

// 根据当前标签页平台更新标题和提示
async function updatePlatformHint() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || '';
    const titleEl = document.querySelector('.title');
    const hintEl  = document.querySelector('.hint');
    if (/instagram\.com/.test(url)) {
      titleEl.textContent = '采集 Instagram 帖子';
      hintEl.innerHTML = '在 <strong>Instagram</strong> 任意页面（主页、用户主页、探索等）点「开始采集」，滚动加载更多。';
    } else if (/x\.com/.test(url)) {
      titleEl.textContent = '采集推文链接';
      hintEl.innerHTML = '在 <strong>x.com</strong> 任意页面（主页、书签、用户主页等）点「开始采集」，滚动加载更多。';
    }
  } catch (_) {}
}
updatePlatformHint();

startBtn.addEventListener('click', async () => {
  hideError();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showError('无法获取当前标签页');
      return;
    }
    port = chrome.tabs.connect(tab.id, { name: 'x-tweets-collect' });
    port.onMessage.addListener((msg) => {
      if (msg.type === 'update' || msg.type === 'done') {
        allItems = msg.items || [];
        renderFilters();
        renderList();
        if (msg.type === 'done') {
          port = null;
          setCollecting(false);
        }
      }
    });
    port.onDisconnect.addListener(() => {
      port = null;
      setCollecting(false);
    });
    port.postMessage({ action: 'start' });
    setCollecting(true);
  } catch (e) {
    showError('采集失败，请确保当前标签页是 x.com 页面并已加载完成，然后刷新后重试。');
  }
});

stopBtn.addEventListener('click', () => {
  if (port) {
    port.postMessage({ action: 'stop' });
  }
  setCollecting(false);
});

copyBtn.addEventListener('click', () => {
  const items = filteredItems();
  const text = items.map((x) => x.link).join('\n');
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '已复制';
    setTimeout(() => { copyBtn.textContent = '复制链接（仅链接，换行分隔）'; }, 1500);
  });
});
