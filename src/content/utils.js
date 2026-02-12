/**
 * AI Chat OutlineMate - 工具函数
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;

  /**
   * 规范化文本（去除多余空格和换行）
   * @param {string} text
   * @returns {string}
   */
  function normalizeText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * 截断文本到指定长度
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  function truncate(text, maxLength) {
    if (!text) return '';
    const normalized = normalizeText(text);
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength - 1) + '…';
  }

  /**
   * 防抖函数
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    };
  }

  /**
   * 节流函数
   * @param {Function} fn
   * @param {number} limit
   * @returns {Function}
   */
  function throttle(fn, limit) {
    let inThrottle = false;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 安全获取Chrome Storage
   * @param {string} key
   * @param {*} defaultValue
   * @returns {Promise<*>}
   */
  async function getStorage(key, defaultValue = null) {
    try {
      const result = await chrome.storage.sync.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (e) {
      console.warn('[OutlineMate] Storage get error:', e);
      return defaultValue;
    }
  }

  /**
   * 安全设置Chrome Storage
   * @param {string} key
   * @param {*} value
   * @returns {Promise<boolean>}
   */
  async function setStorage(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
      return true;
    } catch (e) {
      console.warn('[OutlineMate] Storage set error:', e);
      return false;
    }
  }

  /**
   * 获取用户设置
   * @returns {Promise<Object>}
   */
  async function getSettings() {
    const settings = await getStorage(
      ns.STORAGE_KEYS.SETTINGS,
      ns.DEFAULT_SETTINGS
    );
    return { ...ns.DEFAULT_SETTINGS, ...settings };
  }

  /**
   * 保存用户设置
   * @param {Object} settings
   * @returns {Promise<boolean>}
   */
  async function saveSettings(settings) {
    return setStorage(ns.STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * 生成唯一ID
   * @returns {string}
   */
  function generateId() {
    return 'om_' + Math.random().toString(36).slice(2, 11);
  }

  /**
   * 等待元素出现
   * @param {string} selector
   * @param {number} timeout
   * @param {Element} parent
   * @returns {Promise<Element|null>}
   */
  function waitForElement(selector, timeout = 5000, parent = document) {
    return new Promise((resolve) => {
      const element = parent.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const el = parent.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(parent, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * 检测深色模式
   * @returns {boolean}
   */
  function isDarkMode() {
    const html = document.documentElement;
    const body = document.body;

    // 检查class
    const darkClasses = ['dark', 'dark-mode', 'night-mode', 'theme-dark', 'dark-theme'];
    for (const cls of darkClasses) {
      if (html.classList.contains(cls) || body?.classList.contains(cls)) {
        return true;
      }
    }

    // 检查data属性
    const darkAttrs = [
      ['data-theme', 'dark'],
      ['data-mode', 'dark'],
      ['data-color-scheme', 'dark'],
      ['color-scheme', 'dark'],
    ];
    for (const [attr, value] of darkAttrs) {
      if (html.getAttribute(attr) === value || body?.getAttribute(attr) === value) {
        return true;
      }
    }

    // 检查computed style
    const style = getComputedStyle(html);
    if (style.colorScheme === 'dark') {
      return true;
    }

    // 检查媒体查询
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // 只有在页面没有明确设置亮色主题时才返回true
      const lightClasses = ['light', 'light-mode', 'day-mode', 'theme-light', 'light-theme'];
      for (const cls of lightClasses) {
        if (html.classList.contains(cls) || body?.classList.contains(cls)) {
          return false;
        }
      }
    }

    return false;
  }

  // 导出工具函数
  ns.utils = {
    normalizeText,
    truncate,
    debounce,
    throttle,
    getStorage,
    setStorage,
    getSettings,
    saveSettings,
    generateId,
    waitForElement,
    isDarkMode,
  };
})();
