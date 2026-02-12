/**
 * AI Chat OutlineMate - Kimi 适配器
 * 参考 quickNavigator 的统一消息序列方案
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { PLATFORMS } = ns;

  const USER_SELECTORS = [
    '.chat-content-item.chat-content-item-user',
    '[class*="user-message"]',
    '[class*="human-message"]',
  ];

  const ASSISTANT_SELECTORS = [
    '.chat-content-item.chat-content-item-assistant',
    '[class*="assistant-message"]',
    '[class*="ai-message"]',
  ];

  function queryFirst(selectors) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) return Array.from(elements);
    }
    return [];
  }

  const adapter = {
    name: 'kimi',
    platform: PLATFORMS.KIMI,
    hostPatterns: ['kimi.moonshot.cn', 'kimi.com'],
    highlightBorderRadius: '18px',

    getConversationRoot() {
      const selectors = ['.chat-content', '[class*="chat-container"]', 'main'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return document.body;
    },

    getConversationMessages(root) {
      if (!root) return [];
      // Kimi 的消息是兄弟元素，按 DOM 顺序遍历
      const allUserNodes = queryFirst(USER_SELECTORS);
      const allAssistantNodes = queryFirst(ASSISTANT_SELECTORS);

      // 合并所有消息节点并按 DOM 顺序排序
      const allNodes = [];
      allUserNodes.forEach(node => allNodes.push({ node, role: 'user' }));
      allAssistantNodes.forEach(node => allNodes.push({ node, role: 'assistant' }));

      // 按 DOM 顺序排序
      allNodes.sort((a, b) => {
        const pos = a.node.compareDocumentPosition(b.node);
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });

      return allNodes;
    },

    getObserveTarget() {
      const selectors = ['.chat-content', '[class*="chat-container"]', 'main'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return document.body;
    },
  };

  ns.adapters.registerAdapter(PLATFORMS.KIMI, adapter);
})();
