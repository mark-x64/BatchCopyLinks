'use strict';

const MESSAGES = {
  zh_CN: {
    // popup
    popup_title_default:   '采集帖子链接',
    popup_title_twitter:   '采集推文链接',
    popup_title_instagram: '采集 Instagram 帖子',
    popup_hint_default:    '在 <strong>x.com</strong> 或 <strong>Instagram</strong> 任意页面点「开始采集」，滚动页面加载更多。',
    popup_hint_twitter:    '在 <strong>x.com</strong> 任意页面（主页、书签、用户主页等）点「开始采集」，滚动加载更多。',
    popup_hint_instagram:  '在 <strong>Instagram</strong> 任意页面（主页、用户主页、探索等）点「开始采集」，滚动加载更多。',
    start_btn:       '开始采集',
    scroll_hint:     '请往下滚动页面以加载更多推文，采集会每 1 秒更新。',
    stop_btn:        '停止采集',
    copy_links_btn:  '复制链接（仅链接，换行分隔）',
    filter_label:    '筛选：',
    all_filter:      '全部',
    collected:       '已采集 {0} 条',
    filtered:        '已筛选 {0} / {1} 条',
    copied:          '已复制',
    err_no_tab:      '无法获取当前标签页',
    err_collect:     '采集失败，请确保当前标签页是 x.com 页面并已加载完成，然后刷新后重试。',
    // sidepanel
    sp_title:           '采集收藏链接',
    sp_hint:            '请在 <strong>x.com/i/bookmarks</strong> 页面打开本面板后点击下方按钮。',
    sp_range_title:     '采集范围',
    sp_only_visible:    '仅采集当前视窗内可见的链接',
    sp_deduplicate:     '去重',
    sp_max_prefix:      '最多采集',
    sp_max_suffix:      '条',
    sp_collect_btn:     '采集收藏链接',
    sp_collecting:      '采集中…',
    sp_copy_btn:        '复制到剪贴板',
    sp_count:           '已采集 {0} 条链接（地址之间已换行）',
    sp_err_no_tab:      '无法获取当前标签页',
    sp_err_wrong_page:  '请先在浏览器中打开 x.com/i/bookmarks 页面，再点击采集。',
    sp_err_collect:     '采集失败：请确保当前标签页是 x.com/i/bookmarks 并已加载完成，然后刷新该页面后再试。',
    // type labels
    type_text:        '纯文字',
    type_photo:       '单图',
    type_multi_photo: '多图',
    type_video:       '视频',
    type_gif:         'GIF',
    type_mixed:       '图+视频',
    type_poll:        '投票',
    type_article:     '长文',
    type_reel:        'Reel',
    type_carousel:    '轮播',
    type_unknown:     '其他',
    // lang picker
    lang_picker_title: '选择语言',
    lang_change:       '切换语言',
  },

  zh_TW: {
    // popup
    popup_title_default:   '採集貼文連結',
    popup_title_twitter:   '採集推文連結',
    popup_title_instagram: '採集 Instagram 貼文',
    popup_hint_default:    '在 <strong>x.com</strong> 或 <strong>Instagram</strong> 任意頁面點「開始採集」，滑動頁面載入更多。',
    popup_hint_twitter:    '在 <strong>x.com</strong> 任意頁面（首頁、書籤、用戶頁面等）點「開始採集」，滑動載入更多。',
    popup_hint_instagram:  '在 <strong>Instagram</strong> 任意頁面（首頁、用戶頁面、探索等）點「開始採集」，滑動載入更多。',
    start_btn:       '開始採集',
    scroll_hint:     '請向下滑動頁面以載入更多貼文，採集每 1 秒更新。',
    stop_btn:        '停止採集',
    copy_links_btn:  '複製連結（僅連結，換行分隔）',
    filter_label:    '篩選：',
    all_filter:      '全部',
    collected:       '已採集 {0} 則',
    filtered:        '已篩選 {0} / {1} 則',
    copied:          '已複製',
    err_no_tab:      '無法取得目前分頁',
    err_collect:     '採集失敗，請確認目前分頁為 x.com 且已載入完成，重新整理後再試。',
    // sidepanel
    sp_title:           '採集書籤連結',
    sp_hint:            '請在 <strong>x.com/i/bookmarks</strong> 頁面開啟本面板後點擊下方按鈕。',
    sp_range_title:     '採集範圍',
    sp_only_visible:    '僅採集目前視窗內可見的連結',
    sp_deduplicate:     '去重',
    sp_max_prefix:      '最多採集',
    sp_max_suffix:      '則',
    sp_collect_btn:     '採集書籤連結',
    sp_collecting:      '採集中…',
    sp_copy_btn:        '複製到剪貼簿',
    sp_count:           '已採集 {0} 則連結（地址之間已換行）',
    sp_err_no_tab:      '無法取得目前分頁',
    sp_err_wrong_page:  '請先在瀏覽器中開啟 x.com/i/bookmarks 頁面，再點擊採集。',
    sp_err_collect:     '採集失敗：請確認目前分頁為 x.com/i/bookmarks 且已載入完成，重新整理後再試。',
    // type labels
    type_text:        '純文字',
    type_photo:       '單圖',
    type_multi_photo: '多圖',
    type_video:       '影片',
    type_gif:         'GIF',
    type_mixed:       '圖+影片',
    type_poll:        '投票',
    type_article:     '長文',
    type_reel:        'Reel',
    type_carousel:    '輪播',
    type_unknown:     '其他',
    // lang picker
    lang_picker_title: '選擇語言',
    lang_change:       '切換語言',
  },

  en: {
    // popup
    popup_title_default:   'Collect Post Links',
    popup_title_twitter:   'Collect Tweet Links',
    popup_title_instagram: 'Collect Instagram Posts',
    popup_hint_default:    'Click "Start" on any <strong>x.com</strong> or <strong>Instagram</strong> page, then scroll to load more.',
    popup_hint_twitter:    'Click "Start" on any <strong>x.com</strong> page (Home, Bookmarks, Profile…), then scroll to load more.',
    popup_hint_instagram:  'Click "Start" on any <strong>Instagram</strong> page (Home, Profile, Explore…), then scroll to load more.',
    start_btn:       'Start',
    scroll_hint:     'Scroll down to load more posts. Updates every second.',
    stop_btn:        'Stop',
    copy_links_btn:  'Copy Links (newline-separated)',
    filter_label:    'Filter:',
    all_filter:      'All',
    collected:       'Collected {0}',
    filtered:        'Filtered {0} / {1}',
    copied:          'Copied!',
    err_no_tab:      'Cannot access the current tab.',
    err_collect:     'Collection failed. Make sure you are on x.com, the page is loaded, then refresh and try again.',
    // sidepanel
    sp_title:           'Collect Bookmark Links',
    sp_hint:            'Open this panel on <strong>x.com/i/bookmarks</strong>, then click the button below.',
    sp_range_title:     'Scope',
    sp_only_visible:    'Collect only links visible in the current viewport',
    sp_deduplicate:     'Deduplicate',
    sp_max_prefix:      'Collect at most',
    sp_max_suffix:      'links',
    sp_collect_btn:     'Collect Bookmark Links',
    sp_collecting:      'Collecting…',
    sp_copy_btn:        'Copy to Clipboard',
    sp_count:           'Collected {0} links (newline-separated)',
    sp_err_no_tab:      'Cannot access the current tab.',
    sp_err_wrong_page:  'Please open x.com/i/bookmarks first, then click Collect.',
    sp_err_collect:     'Collection failed. Make sure the tab is x.com/i/bookmarks and fully loaded, then refresh and try again.',
    // type labels
    type_text:        'Text',
    type_photo:       'Photo',
    type_multi_photo: 'Multi-Photo',
    type_video:       'Video',
    type_gif:         'GIF',
    type_mixed:       'Photo+Video',
    type_poll:        'Poll',
    type_article:     'Article',
    type_reel:        'Reel',
    type_carousel:    'Carousel',
    type_unknown:     'Other',
    // lang picker
    lang_picker_title: 'Choose Language',
    lang_change:       'Language',
  },

  ja: {
    // popup
    popup_title_default:   '投稿リンクを一括収集',
    popup_title_twitter:   'ツイートリンクを一括収集',
    popup_title_instagram: 'Instagram 投稿を一括収集',
    popup_hint_default:    '<strong>x.com</strong> または <strong>Instagram</strong> の任意のページで「収集開始」をクリックし、スクロールして追加読み込み。',
    popup_hint_twitter:    '<strong>x.com</strong> の任意のページ（ホーム・ブックマーク・プロフィールなど）で「収集開始」をクリックし、スクロールして追加読み込み。',
    popup_hint_instagram:  '<strong>Instagram</strong> の任意のページ（ホーム・プロフィール・探索など）で「収集開始」をクリックし、スクロールして追加読み込み。',
    start_btn:       '収集開始',
    scroll_hint:     'スクロールして投稿を追加読み込みしてください。1 秒ごとに更新されます。',
    stop_btn:        '収集停止',
    copy_links_btn:  'リンクをコピー（改行区切り）',
    filter_label:    'フィルター：',
    all_filter:      'すべて',
    collected:       '{0} 件収集済み',
    filtered:        '{0} / {1} 件',
    copied:          'コピーしました',
    err_no_tab:      'タブを取得できませんでした。',
    err_collect:     '収集に失敗しました。x.com を開いて読み込み完了後、リロードしてやり直してください。',
    // sidepanel
    sp_title:           'ブックマークリンクを収集',
    sp_hint:            '<strong>x.com/i/bookmarks</strong> ページでこのパネルを開いてから下のボタンをクリックしてください。',
    sp_range_title:     '収集範囲',
    sp_only_visible:    '現在のビューポートに表示されているリンクのみ収集',
    sp_deduplicate:     '重複を除く',
    sp_max_prefix:      '最大',
    sp_max_suffix:      '件まで収集',
    sp_collect_btn:     'ブックマークリンクを収集',
    sp_collecting:      '収集中…',
    sp_copy_btn:        'クリップボードにコピー',
    sp_count:           '{0} 件のリンクを収集しました（改行区切り）',
    sp_err_no_tab:      'タブを取得できませんでした。',
    sp_err_wrong_page:  'まず x.com/i/bookmarks を開いてから収集ボタンをクリックしてください。',
    sp_err_collect:     '収集に失敗しました。x.com/i/bookmarks タブが完全に読み込まれているか確認し、リロードしてやり直してください。',
    // type labels
    type_text:        'テキスト',
    type_photo:       '写真',
    type_multi_photo: '複数写真',
    type_video:       '動画',
    type_gif:         'GIF',
    type_mixed:       '写真＋動画',
    type_poll:        '投票',
    type_article:     '記事',
    type_reel:        'リール',
    type_carousel:    'カルーセル',
    type_unknown:     'その他',
    // lang picker
    lang_picker_title: '言語を選択',
    lang_change:       '言語',
  },
};

// Language display names for the picker UI
const LANG_OPTIONS = [
  { code: 'zh_CN', label: '中文（简体）' },
  { code: 'zh_TW', label: '中文（繁體）' },
  { code: 'en',    label: 'English' },
  { code: 'ja',    label: '日本語' },
];

let currentLang = 'zh_CN';

/** Translate a key, with optional positional placeholders {0}, {1}… */
function t(key, ...args) {
  let msg = (MESSAGES[currentLang] || MESSAGES.zh_CN)[key] || key;
  args.forEach((arg, i) => { msg = msg.replace(`{${i}}`, arg); });
  return msg;
}

/** Translate a post type key (handles hyphens in type names like "multi-photo") */
function typeLabel(type) {
  return t('type_' + type.replace(/-/g, '_'));
}

/** Apply data-i18n / data-i18n-html attributes to all matching elements */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
}

/**
 * Read the stored language preference.
 * Falls back to browser locale on first launch.
 * Returns true if this is the first launch (no preference stored yet).
 */
async function initLang() {
  const { lang } = await chrome.storage.local.get('lang');
  if (lang && MESSAGES[lang]) {
    currentLang = lang;
    return false; // not first launch
  }
  // Auto-detect from browser locale
  const bl = (navigator.language || '').toLowerCase();
  if (bl.startsWith('zh-tw') || bl.startsWith('zh-hk')) currentLang = 'zh_TW';
  else if (bl.startsWith('zh'))                          currentLang = 'zh_CN';
  else if (bl.startsWith('ja'))                          currentLang = 'ja';
  else                                                   currentLang = 'en';
  return true; // first launch
}

/** Persist the chosen language and update currentLang */
async function setLang(lang) {
  currentLang = lang;
  await chrome.storage.local.set({ lang });
}
