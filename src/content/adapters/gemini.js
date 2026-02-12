/**
 * AI Chat OutlineMate - Gemini 适配器
 * 严格对齐 quickNavigator 的 Gemini 实现
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { PLATFORMS } = ns;

  // 严格对齐 quickNavigator 的选择器配置
  const GEMINI_SELECTORS = {
    root: ['chat-window', 'main', 'body'],
    turn: ['.conversation-container'],
    user: ['user-query .query-text', 'user-query'],
    assistant: ['model-response message-content', 'model-response'],
  };

  // role 属性兜底（与 quickNavigator 一致）
  const ROLE_ATTRIBUTES = ['data-message-author-role', 'data-author-role', 'data-role'];
  const ROLE_ALIASES = {
    user: new Set(['user', 'human', 'me']),
    assistant: new Set(['assistant', 'ai', 'bot', 'model']),
  };

  function findFirst(root, selectors) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function matchesAny(node, selectors) {
    for (const selector of selectors) {
      try {
        if (node.matches(selector)) return true;
      } catch (e) { /* ignore */ }
    }
    return false;
  }

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

  function getRoleFromGeminiNode(node) {
    if (matchesAny(node, GEMINI_SELECTORS.user)) return 'user';
    if (matchesAny(node, GEMINI_SELECTORS.assistant)) return 'assistant';
    // 兜底：尝试 role 属性（与 quickNavigator 一致）
    return getRoleFromNode(node);
  }

  function collectGeminiTurns(turns) {
    const messages = [];
    turns.forEach(turn => {
      const userNode = findFirst(turn, GEMINI_SELECTORS.user);
      if (userNode) {
        messages.push({ node: userNode, role: 'user' });
      }
      const assistantNode = findFirst(turn, GEMINI_SELECTORS.assistant);
      if (assistantNode) {
        messages.push({ node: assistantNode, role: 'assistant' });
      }
    });
    return messages;
  }

  function collectGeminiNodes(root) {
    const selector = GEMINI_SELECTORS.user.concat(GEMINI_SELECTORS.assistant).join(',');
    let nodes;
    try {
      nodes = root.querySelectorAll(selector);
    } catch (e) {
      return [];
    }
    const messages = [];
    nodes.forEach(node => {
      const role = getRoleFromGeminiNode(node);
      if (role) {
        messages.push({ node, role });
      }
    });
    return messages;
  }

  function getMessagesFromRoleAttributes(root) {
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
  }

  const adapter = {
    name: 'gemini',
    platform: PLATFORMS.GEMINI,
    hostPatterns: ['gemini.google.com'],
    highlightBorderRadius: '18px',

    getConversationRoot() {
      return findFirst(document, GEMINI_SELECTORS.root) || document.body;
    },

    getConversationMessages(root) {
      if (!root) return [];
      // 策略1：通过 .conversation-container turn 容器收集
      const turns = root.querySelectorAll(GEMINI_SELECTORS.turn.join(','));
      if (turns.length) {
        return collectGeminiTurns(turns);
      }
      // 策略2：通过 Gemini 特有的自定义元素选择器收集
      const byNode = collectGeminiNodes(root);
      if (byNode.length) {
        return byNode;
      }
      // 策略3：兜底 - 通过 role 属性收集（与 quickNavigator 一致）
      return getMessagesFromRoleAttributes(root);
    },

    getObserveTarget() {
      return findFirst(document, GEMINI_SELECTORS.root) || document.body;
    },
  };

  ns.adapters.registerAdapter(PLATFORMS.GEMINI, adapter);
})();
