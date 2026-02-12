/**
 * AI Chat OutlineMate - 豆包 适配器
 * 参考 quickNavigator 的统一消息序列方案
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { PLATFORMS } = ns;

  const USER_SELECTORS = [
    'div[data-testid="send_message"]',
    '.user-message',
    '[class*="user-message"]',
    '[class*="user"][class*="message"]',
    '[class*="send"][class*="message"]',
    '[class*="question"]',
  ];

  const ASSISTANT_SELECTORS = [
    'div[data-testid="receive_message"]',
    '.bot-message',
    '[class*="bot-message"]',
    '[class*="receive"][class*="message"]',
    '[class*="answer"]',
  ];

  function queryAll(selectors) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) return Array.from(elements);
    }
    return [];
  }

  const adapter = {
    name: 'doubao',
    platform: PLATFORMS.DOUBAO,
    hostPatterns: ['doubao.com'],
    highlightBorderRadius: '18px',

    getConversationRoot() {
      const selectors = ['.chat-container', '[class*="chat-container"]', 'main'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return document.body;
    },

    getConversationMessages(root) {
      if (!root) return [];
      const allUserNodes = queryAll(USER_SELECTORS);
      const allAssistantNodes = queryAll(ASSISTANT_SELECTORS);

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
      const selectors = ['.chat-container', '[class*="chat-container"]', 'main'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return document.body;
    },
  };

  ns.adapters.registerAdapter(PLATFORMS.DOUBAO, adapter);
})();
