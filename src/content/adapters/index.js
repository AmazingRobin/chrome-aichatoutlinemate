/**
 * AI Chat OutlineMate - 适配器入口
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { PLATFORMS } = ns;

  // 适配器注册表
  const adapterRegistry = {};

  /**
   * 注册适配器
   * @param {string} platform - 平台标识
   * @param {Object} adapter - 适配器对象
   */
  function registerAdapter(platform, adapter) {
    adapterRegistry[platform] = adapter;
  }

  /**
   * 根据当前URL检测平台
   * @returns {string} 平台标识
   */
  function detectPlatform() {
    const hostname = window.location.hostname;

    if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
      return PLATFORMS.CHATGPT;
    }
    if (hostname.includes('gemini.google.com')) {
      return PLATFORMS.GEMINI;
    }
    if (hostname.includes('doubao.com')) {
      return PLATFORMS.DOUBAO;
    }
    if (hostname.includes('kimi.moonshot.cn') || hostname.includes('kimi.com')) {
      return PLATFORMS.KIMI;
    }
    if (hostname.includes('tongyi.aliyun.com') || hostname.includes('qianwen.com')) {
      return PLATFORMS.QWEN;
    }

    return PLATFORMS.UNKNOWN;
  }

  /**
   * 获取当前平台的适配器
   * @returns {Object|null} 适配器对象
   */
  function getAdapter() {
    const platform = detectPlatform();
    return adapterRegistry[platform] || null;
  }

  /**
   * 获取指定平台的适配器
   * @param {string} platform - 平台标识
   * @returns {Object|null} 适配器对象
   */
  function getAdapterByPlatform(platform) {
    return adapterRegistry[platform] || null;
  }

  // 导出适配器模块
  ns.adapters = {
    registerAdapter,
    detectPlatform,
    getAdapter,
    getAdapterByPlatform,
    registry: adapterRegistry,
  };
})();
