/**
 * AI Chat OutlineMate - ChatGPT 适配器
 * 参考 quickNavigator 的 role 属性统一提取方案
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { PLATFORMS } = ns;

  // 支持多种 role 属性名（ChatGPT 可能使用不同版本的属性）
  const ROLE_ATTRIBUTES = ['data-message-author-role', 'data-author-role', 'data-role'];
  const ROLE_ALIASES = {
    user: new Set(['user', 'human', 'me']),
    assistant: new Set(['assistant', 'ai', 'bot', 'model']),
  };

  /**
   * 从节点的 role 属性中解析角色
   * @param {Element} node
   * @returns {string|null}
   */
  function getRoleFromNode(node) {
    for (const attr of ROLE_ATTRIBUTES) {
      const value = node.getAttribute(attr);
      if (!value) continue;
      const normalized = value.toLowerCase();
      if (ROLE_ALIASES.user.has(normalized)) return 'user';
      if (ROLE_ALIASES.assistant.has(normalized)) return 'assistant';
    }
    return null;
  }

  const adapter = {
    name: 'chatgpt',
    platform: PLATFORMS.CHATGPT,
    hostPatterns: ['chatgpt.com', 'chat.openai.com'],
    highlightBorderRadius: '18px',

    /**
     * 获取对话根容器
     * @returns {Element|null}
     */
    getConversationRoot() {
      return document.querySelector('main') || document.body;
    },

    /**
     * 获取对话中所有消息的有序序列（用户+AI交替）
     * 返回 {node, role} 数组，由 core 层统一处理配对和预览生成
     * @param {Element} root
     * @returns {Array<{node: Element, role: string}>}
     */
    getConversationMessages(root) {
      if (!root) return [];
      const selector = ROLE_ATTRIBUTES.map(attr => `[${attr}]`).join(',');
      const nodes = root.querySelectorAll(selector);
      const messages = [];
      nodes.forEach(node => {
        const role = getRoleFromNode(node);
        if (role) {
          messages.push({ node, role });
        }
      });
      return messages;
    },

    /**
     * 获取用于监听DOM变化的容器
     * @returns {Element|null}
     */
    getObserveTarget() {
      return document.querySelector('main') || document.body;
    },
  };

  // 注册适配器
  ns.adapters.registerAdapter(PLATFORMS.CHATGPT, adapter);
})();
