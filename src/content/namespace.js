/**
 * AI Chat OutlineMate - 命名空间和全局配置
 */
(() => {
  'use strict';

  window.OutlineMate = {
    // 全局配置
    CONFIG: {
      previewMaxLength: 100,    // 预览文本最大长度
      titleMaxLength: 50,       // 标题最大长度
      debounceMs: 300,          // 防抖延迟
      sidebarWidth: 320,        // 侧边栏展开宽度
      collapsedWidth: 40,       // 侧边栏收起宽度
      scrollBehavior: 'smooth', // 滚动行为
      intersectionThreshold: 0, // IntersectionObserver阈值
      rootMargin: '-45% 0px -45% 0px', // 检测屏幕中间10%区域
    },

    // 平台枚举
    PLATFORMS: {
      CHATGPT: 'chatgpt',
      GEMINI: 'gemini',
      DOUBAO: 'doubao',
      KIMI: 'kimi',
      QWEN: 'qwen',
      UNKNOWN: 'unknown'
    },

    // 默认用户设置
    DEFAULT_SETTINGS: {
      showPreview: true,        // 是否显示AI回复预览
      sidebarPosition: 'right', // 侧边栏位置: 'left' | 'right'
      enabled: true,            // 是否启用插件
    },

    // 存储键名
    STORAGE_KEYS: {
      SETTINGS: 'outlinemate_settings',
      SIDEBAR_VISIBLE: 'outlinemate_sidebar_visible',
    },

    // 模块占位符（由各模块填充）
    utils: null,
    adapters: null,
    ui: null,
    core: null,
  };
})();
