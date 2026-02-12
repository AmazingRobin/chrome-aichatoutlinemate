/**
 * AI Chat OutlineMate - 内容脚本入口
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;

  // 等待DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => ns.core.init(), 500);
    });
  } else {
    // DOM已加载，延迟初始化以确保页面完全渲染
    setTimeout(() => ns.core.init(), 500);
  }

  // 监听页面卸载
  window.addEventListener('beforeunload', () => {
    ns.core.destroy();
  });

  // 监听URL变化（SPA应用）
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // URL变化时重新初始化
      setTimeout(() => {
        ns.core.destroy();
        ns.core.init();
      }, 1000);
    }
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
