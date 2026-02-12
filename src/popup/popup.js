/**
 * AI Chat OutlineMate - Popup 逻辑
 */
(() => {
  'use strict';

  // 存储键名
  const STORAGE_KEY = 'outlinemate_settings';
  const LANGUAGE_KEY = 'outlinemate_language';

  // 默认设置
  const DEFAULT_SETTINGS = {
    enabled: true,
    showPreview: true,
    sidebarPosition: 'right',
  };

  // DOM元素
  const elements = {
    enabled: document.getElementById('enabled'),
    showPreview: document.getElementById('showPreview'),
    sidebarPosition: document.getElementById('sidebarPosition'),
    language: document.getElementById('language'),
    resetBtn: document.getElementById('resetBtn'),
  };

  // 翻译数据缓存
  let translations = null;

  /**
   * 加载翻译文件
   * @param {string} lang - 语言代码
   * @returns {Promise<Object>}
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`../../_locales/${lang}/messages.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('Failed to load translations:', e);
    }
    return null;
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @returns {string}
   */
  function getMessage(key) {
    // 如果有自定义翻译，优先使用
    if (translations && translations[key]) {
      return translations[key].message;
    }
    // 否则使用 Chrome i18n API
    return chrome.i18n.getMessage(key);
  }

  /**
   * 初始化国际化文本
   */
  async function initI18n() {
    // 检查是否有保存的语言设置
    const result = await chrome.storage.sync.get(LANGUAGE_KEY);
    const savedLang = result[LANGUAGE_KEY] || 'auto';

    // 设置语言选择器的值
    if (elements.language) {
      elements.language.value = savedLang;
    }

    // 如果不是自动，加载对应的翻译文件
    if (savedLang !== 'auto') {
      translations = await loadTranslations(savedLang);
    }

    // 替换所有带 data-i18n 属性的元素文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const message = getMessage(key);
      if (message) {
        el.textContent = message;
      }
    });

    // 替换所有带 data-i18n-title 属性的元素 title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const message = getMessage(key);
      if (message) {
        el.setAttribute('title', message);
      }
    });
  }

  /**
   * 加载设置
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEY);
      const settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };

      // 应用到UI
      elements.enabled.checked = settings.enabled;
      if (elements.showPreview) elements.showPreview.checked = settings.showPreview;
      if (elements.sidebarPosition) elements.sidebarPosition.value = settings.sidebarPosition;
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  /**
   * 保存设置
   */
  async function saveSettings() {
    const settings = {
      enabled: elements.enabled.checked,
      showPreview: elements.showPreview ? elements.showPreview.checked : DEFAULT_SETTINGS.showPreview,
      sidebarPosition: elements.sidebarPosition ? elements.sidebarPosition.value : DEFAULT_SETTINGS.sidebarPosition,
    };

    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: settings });

      // 通知当前标签页更新设置
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings,
          });
        } catch (e) {
          // 标签页可能没有加载内容脚本，忽略错误
        }
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  /**
   * 保存语言设置并重载页面
   */
  async function saveLanguage() {
    const lang = elements.language.value;
    await chrome.storage.sync.set({ [LANGUAGE_KEY]: lang });
    // 重载页面以应用新语言
    location.reload();
  }

  /**
   * 重置设置
   */
  async function resetSettings() {
    try {
      await chrome.storage.sync.set({
        [STORAGE_KEY]: DEFAULT_SETTINGS,
        [LANGUAGE_KEY]: 'auto',
      });

      // 更新UI
      elements.enabled.checked = DEFAULT_SETTINGS.enabled;
      if (elements.showPreview) elements.showPreview.checked = DEFAULT_SETTINGS.showPreview;
      if (elements.sidebarPosition) elements.sidebarPosition.value = DEFAULT_SETTINGS.sidebarPosition;
      elements.language.value = 'auto';

      // 通知当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: DEFAULT_SETTINGS,
          });
        } catch (e) {
          // 忽略错误
        }
      }

      showToast(getMessage('settingsReset'));

      // 重载以应用默认语言
      setTimeout(() => location.reload(), 1000);
    } catch (e) {
      console.error('Failed to reset settings:', e);
    }
  }

  /**
   * 显示提示消息
   * @param {string} message
   */
  function showToast(message) {
    // 移除已有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建新toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自动隐藏
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * 初始化事件监听
   */
  function initEventListeners() {
    // 设置变更
    elements.enabled.addEventListener('change', saveSettings);
    if (elements.showPreview) elements.showPreview.addEventListener('change', saveSettings);
    if (elements.sidebarPosition) elements.sidebarPosition.addEventListener('change', saveSettings);

    // 语言变更
    if (elements.language) {
      elements.language.addEventListener('change', saveLanguage);
    }

    // 重置按钮
    elements.resetBtn.addEventListener('click', resetSettings);
  }

  // 初始化
  document.addEventListener('DOMContentLoaded', async () => {
    await initI18n();
    await loadSettings();
    initEventListeners();
  });
})();
