'use strict';

const startBtn       = document.getElementById('startBtn');
const stopBtn        = document.getElementById('stopBtn');
const collectActions = document.getElementById('collectActions');
const stopActions    = document.getElementById('stopActions');
const scrollHint     = document.getElementById('scrollHint');
const resultSection  = document.getElementById('resultSection');
const resultTitle    = document.getElementById('resultTitle');
const filterBar      = document.getElementById('filterBar');
const filterChips    = document.getElementById('filterChips');
const itemList       = document.getElementById('itemList');
const copyBtn        = document.getElementById('copyBtn');
const errorEl        = document.getElementById('error');
const mainTitle      = document.getElementById('mainTitle');
const mainHint       = document.getElementById('mainHint');
const langPickerEl   = document.getElementById('langPicker');
const langToggleBtn  = document.getElementById('langToggle');

let port = null;
let allItems = [];
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

  if (types.length <= 1) {
    filterBar.classList.add('hidden');
    return;
  }
  filterBar.classList.remove('hidden');
  filterChips.innerHTML = '';

  const allChip = document.createElement('span');
  allChip.className = 'filter-chip' + (activeFilters.size === 0 ? ' active' : '');
  allChip.textContent = `${t('all_filter')} (${allItems.length})`;
  allChip.addEventListener('click', () => {
    activeFilters.clear();
    renderFilters();
    renderList();
  });
  filterChips.appendChild(allChip);

  const typeOrder = ['text','photo','multi-photo','video','gif','mixed','poll','article','reel','carousel','unknown'];
  const orderedTypes = typeOrder.filter((tp) => counts[tp] !== undefined);
  const remaining    = types.filter((tp) => !orderedTypes.includes(tp));

  for (const type of [...orderedTypes, ...remaining]) {
    const chip = document.createElement('span');
    chip.className = 'filter-chip' + (activeFilters.has(type) ? ' active' : '');
    chip.textContent = `${typeLabel(type)} (${counts[type]})`;
    chip.addEventListener('click', () => {
      if (activeFilters.has(type)) activeFilters.delete(type);
      else activeFilters.add(type);
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
    ? t('collected', allItems.length)
    : t('filtered', items.length, allItems.length);

  itemList.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'item-row';

    const badge = document.createElement('span');
    badge.className = `type-badge type-${item.type}`;
    badge.textContent = typeLabel(item.type);

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

async function updatePlatformHint() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || '';
    if (/instagram\.com/.test(url)) {
      mainTitle.textContent = t('popup_title_instagram');
      mainHint.innerHTML    = t('popup_hint_instagram');
    } else if (/x\.com/.test(url)) {
      mainTitle.textContent = t('popup_title_twitter');
      mainHint.innerHTML    = t('popup_hint_twitter');
    } else {
      mainTitle.textContent = t('popup_title_default');
      mainHint.innerHTML    = t('popup_hint_default');
    }
  } catch (_) {
    mainTitle.textContent = t('popup_title_default');
    mainHint.innerHTML    = t('popup_hint_default');
  }
}

// ── Language picker ───────────────────────────────────────────────────────────

langToggleBtn.addEventListener('click', () => {
  langPickerEl.classList.remove('hidden');
});

document.querySelectorAll('.lang-opt-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    await setLang(btn.dataset.lang);
    applyTranslations();
    await updatePlatformHint();
    renderFilters();
    renderList();
    langPickerEl.classList.add('hidden');
  });
});

// ── Collect actions ───────────────────────────────────────────────────────────

startBtn.addEventListener('click', async () => {
  hideError();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showError(t('err_no_tab'));
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
  } catch (_) {
    showError(t('err_collect'));
  }
});

stopBtn.addEventListener('click', () => {
  if (port) port.postMessage({ action: 'stop' });
  setCollecting(false);
});

copyBtn.addEventListener('click', () => {
  const items = filteredItems();
  const text = items.map((x) => x.link).join('\n');
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = t('copied');
    setTimeout(() => { copyBtn.textContent = t('copy_links_btn'); }, 1500);
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────

(async () => {
  const firstLaunch = await initLang();
  applyTranslations();
  await updatePlatformHint();
  if (firstLaunch) langPickerEl.classList.remove('hidden');
})();
