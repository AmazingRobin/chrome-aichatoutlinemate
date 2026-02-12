/**
 * AI Chat OutlineMate - 千问 适配器
 * 参考 quickNavigator 的统一消息序列方案
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { PLATFORMS } = ns;

  const USER_SELECTORS = [
    'div[class*="questionItem-"][data-msgid]',
    '[class*="user-message"]',
    '[class*="question"]',
  ];

  const ASSISTANT_SELECTORS = [
    'div[class*="answerItem-"][data-msgid]',
    '[class*="assistant-message"]',
    '[class*="answer"]',
  ];

  function queryFirst(selectors) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) return Array.from(elements);
    }
    return [];
  }

  // 千问正文内容选择器（用于从容器中精确提取正文，过滤按钮/头像/meta 等 UI 元素）
  // answerItem 容器结构：answerMeta（模型名+时间） + answerContent（正文） + 操作按钮
  const TEXT_SELECTORS = [
    'div[class*="answerContent-"]',
    'div[class*="questionContent-"]',
    'div[class*="bubble-"]',
    '.markdown-body',
  ];

  const adapter = {
    name: 'qwen',
    platform: PLATFORMS.QWEN,
    hostPatterns: ['tongyi.aliyun.com', 'qianwen.com'],
    highlightBorderRadius: '18px',

    /**
     * 从消息容器节点中精确提取正文文本
     * 千问的 answerItem 容器结构：
     *   answerMeta（"Qwen3-Max 11:22:35"）← 需要排除
     *   answerContent（正文）← 需要提取
     *   操作按钮 ← 需要排除
     * @param {Element} node
     * @param {string} role
     * @returns {string}
     */
    getTextFromNode(node, role) {
      for (const selector of TEXT_SELECTORS) {
        const textEl = node.querySelector(selector);
        if (textEl && textEl.textContent.trim()) {
          return textEl.textContent.trim();
        }
      }
      return node.textContent || '';
    },

    getConversationRoot() {
      const selectors = ['[class*="chat-container"]', '[class*="conversation"]', 'main'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return document.body;
    },

    getConversationMessages(root) {
      if (!root) return [];
      const allUserNodes = queryFirst(USER_SELECTORS);
      const allAssistantNodes = queryFirst(ASSISTANT_SELECTORS);

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
      const selectors = ['[class*="chat-container"]', '[class*="conversation"]', 'main'];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return document.body;
    },
  };

  ns.adapters.registerAdapter(PLATFORMS.QWEN, adapter);
})();
