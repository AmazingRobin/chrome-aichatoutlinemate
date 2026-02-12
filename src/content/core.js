/**
 * AI Chat OutlineMate - 核心业务逻辑
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { CONFIG, STORAGE_KEYS } = ns;

  // 状态管理
  const state = {
    initialized: false,
    adapter: null,
    ui: null,
    settings: null,
    messages: [],
    activeIndex: -1,
    visible: true,
    observer: null,
    intersectionObserver: null,
    darkModeObserver: null,
    isScrollingByClick: false,
    lastSignature: '',
    conversationRoot: null,
  };

  /**
   * 初始化
   */
  async function init() {
    if (state.initialized) return;

    // 获取适配器
    state.adapter = ns.adapters.getAdapter();
    if (!state.adapter) {
      console.log('[OutlineMate] Platform not supported');
      return;
    }

    console.log(`[OutlineMate] Detected platform: ${state.adapter.name}`);

    // 加载设置
    state.settings = await ns.utils.getSettings();

    // 创建UI
    const isDark = ns.utils.isDarkMode();
    state.ui = ns.ui.createSidebar({
      position: state.settings.sidebarPosition,
      isDark,
      showPreview: state.settings.showPreview,
    });

    // 如果未启用，隐藏侧边栏但保持初始化
    if (!state.settings.enabled) {
      ns.ui.setSidebarVisible(state.ui, false);
      console.log('[OutlineMate] Plugin disabled, sidebar hidden');
    }

    // 初始化事件监听
    setupEventListeners();

    // 启动深色模式监听
    startDarkModeObserver();

    // 启动滚动高亮监听
    startIntersectionObserver();

    // 首次刷新
    refreshDirectory();

    // 监听来自background的消息（快捷键）
    chrome.runtime.onMessage.addListener(handleMessage);

    state.initialized = true;
    console.log('[OutlineMate] Initialized');
  }

  /**
   * 设置事件监听
   */
  function setupEventListeners() {
    const { list } = state.ui;

    // 点击事件（事件委托）
    list.addEventListener('click', handleItemClick);

    // 键盘事件
    list.addEventListener('keydown', handleKeydown);
  }

  /**
   * 处理列表项点击
   * @param {Event} e
   */
  function handleItemClick(e) {
    const item = e.target.closest('.om-item');
    if (!item) return;

    const index = parseInt(item.getAttribute('data-index'), 10);
    if (isNaN(index) || index < 0 || index >= state.messages.length) return;

    scrollToMessage(index);
  }

  /**
   * 处理键盘事件
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    const item = e.target.closest('.om-item');
    if (!item) return;

    const index = parseInt(item.getAttribute('data-index'), 10);

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        scrollToMessage(index);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(state.messages.length - 1);
        break;
    }
  }

  /**
   * 聚焦指定索引的列表项
   * @param {number} index
   */
  function focusItem(index) {
    if (index < 0 || index >= state.messages.length) return;

    const { list } = state.ui;
    const items = list.querySelectorAll('.om-item');
    if (items[index]) {
      items[index].focus();
    }
  }

  /**
   * 滚动到指定消息
   * @param {number} index
   */
  function scrollToMessage(index) {
    const msg = state.messages[index];
    if (!msg || !msg.el) return;

    state.isScrollingByClick = true;

    // 多策略滚动定位
    let targetEl = msg.el;

    // 策略1：检查元素是否仍然连接到DOM
    if (!targetEl.isConnected) {
      // 策略2：重新收集消息并通过文本匹配
      const freshMessages = collectMessagesFromAdapter();
      const match = freshMessages.find(m => m.title === msg.title);
      if (match && match.el.isConnected) {
        targetEl = match.el;
      } else {
        // 策略3：通过索引匹配
        if (freshMessages[index] && freshMessages[index].el.isConnected) {
          targetEl = freshMessages[index].el;
        }
      }
    }

    if (targetEl && targetEl.isConnected) {
      // 滚动到顶部位置
      targetEl.scrollIntoView({
        behavior: CONFIG.scrollBehavior,
        block: 'start',
      });

      // 更新激活状态
      state.activeIndex = index;
      ns.ui.updateActiveItem(state.ui, index);

      // 添加高亮闪烁效果
      highlightElement(targetEl);

      // Kimi专属修正：双重保障应对动态加载
      if (state.adapter.name === 'kimi') {
        setTimeout(() => {
          if (targetEl.isConnected) {
            targetEl.scrollIntoView({
              behavior: 'auto',
              block: 'start',
            });
          }
        }, 150);
      }
    }

    // 重置滚动标记
    setTimeout(() => {
      state.isScrollingByClick = false;
    }, 500);
  }

  /**
   * 高亮闪烁元素
   * @param {Element} el
   */
  function highlightElement(el) {
    if (!el) return;

    // 获取适配器配置的圆角
    const borderRadius = state.adapter?.highlightBorderRadius || '0';

    // 保存原始样式
    const originalTransition = el.style.transition;
    const originalBackground = el.style.background;
    const originalBorderRadius = el.style.borderRadius;

    // 添加高亮样式（仅背景色+圆角）
    el.style.transition = 'background 0.3s ease';
    el.style.background = 'rgba(0, 108, 255, 0.12)';
    el.style.borderRadius = borderRadius;

    // 闪烁效果：淡出
    setTimeout(() => {
      el.style.background = originalBackground || '';
    }, 1500);

    // 恢复原始样式
    setTimeout(() => {
      el.style.transition = originalTransition || '';
      el.style.borderRadius = originalBorderRadius || '';
    }, 1800);
  }

  /**
   * 启动深色模式监听
   */
  function startDarkModeObserver() {
    const checkDarkMode = () => {
      const isDark = ns.utils.isDarkMode();
      ns.ui.updateDarkMode(state.ui, isDark);
    };

    state.darkModeObserver = new MutationObserver(checkDarkMode);

    state.darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-mode', 'data-color-scheme', 'style'],
    });

    if (document.body) {
      state.darkModeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-mode'],
      });
    }

    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkDarkMode);
    }
  }

  /**
   * 启动滚动高亮监听
   */
  function startIntersectionObserver() {
    state.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (state.isScrollingByClick) return;

        // 找出所有可见的消息
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length === 0) return;

        // 找到最接近视口中心的消息
        const viewportCenter = window.innerHeight / 2;
        let closestEntry = null;
        let closestDistance = Infinity;

        for (const entry of visibleEntries) {
          const rect = entry.boundingClientRect;
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestEntry = entry;
          }
        }

        if (closestEntry) {
          const index = state.messages.findIndex(m => m.el === closestEntry.target);
          if (index !== -1 && index !== state.activeIndex) {
            state.activeIndex = index;
            ns.ui.updateActiveItem(state.ui, index);
          }
        }
      },
      {
        rootMargin: CONFIG.rootMargin,
        threshold: CONFIG.intersectionThreshold,
      }
    );
  }

  /**
   * 从适配器收集消息并在核心层统一生成预览
   * 参考 quickNavigator 的 rebuild() 逻辑：
   * 1. 通过适配器获取 {node, role} 有序序列
   * 2. 遍历序列，为每个 user 消息找到紧随其后的 assistant 消息
   * 3. 在核心层统一提取文本和生成预览
   * @returns {Array<{el: Element, title: string, preview: string, text: string, endNode: Element|null}>}
   */
  function collectMessagesFromAdapter() {
    const root = state.adapter.getConversationRoot
      ? state.adapter.getConversationRoot()
      : (state.adapter.getObserveTarget() || document.body);

    if (!root) return [];

    // 更新 conversationRoot 引用（用于 observer 重新绑定）
    if (root !== state.conversationRoot) {
      state.conversationRoot = root;
      reattachObserver(root);
    }

    const sequence = state.adapter.getConversationMessages
      ? state.adapter.getConversationMessages(root)
      : [];

    const messages = [];
    const { normalizeText, truncate } = ns.utils;

    // 适配器可提供 getTextFromNode(node, role) 精确提取正文，过滤 UI 元素文本
    const extractText = (node, role) => {
      if (state.adapter.getTextFromNode) {
        return normalizeText(state.adapter.getTextFromNode(node, role) || '');
      }
      return normalizeText(node.textContent || '');
    };

    sequence.forEach((entry, index) => {
      if (entry.role !== 'user') return;

      const text = extractText(entry.node, 'user');
      const title = text
        ? truncate(text, CONFIG.titleMaxLength)
        : `Prompt ${messages.length + 1}`;

      // 向后查找紧随的 assistant 消息（参考 quickNavigator 的配对逻辑）
      let assistantText = '';
      let lastAssistantNode = null;
      for (let i = index + 1; i < sequence.length; i++) {
        if (sequence[i].role === 'assistant') {
          if (!assistantText) {
            assistantText = extractText(sequence[i].node, 'assistant');
          }
          lastAssistantNode = sequence[i].node;
          continue;
        }
        if (sequence[i].role === 'user') {
          break;
        }
      }

      const preview = assistantText
        ? truncate(assistantText, CONFIG.previewMaxLength)
        : '';

      if (title) {
        messages.push({
          el: entry.node,
          title,
          preview,
          text,
          endNode: lastAssistantNode,
        });
      }
    });

    return messages;
  }

  /**
   * 重新绑定 MutationObserver 到新的对话根节点
   * @param {Element} root
   */
  function reattachObserver(root) {
    if (state.observer) {
      state.observer.disconnect();
    }

    if (!root) return;

    const debouncedRefresh = ns.utils.debounce(() => {
      refreshDirectory();
    }, CONFIG.debounceMs);

    state.observer = new MutationObserver(() => {
      debouncedRefresh();
    });

    state.observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /**
   * 刷新目录
   * 参考 quickNavigator 的签名机制：包含消息数量、最后一条消息的文本和预览
   * 这样当 AI 正在生成回复时，预览变化也能触发更新
   */
  function refreshDirectory() {
    if (!state.adapter || !state.ui) return;

    const newMessages = collectMessagesFromAdapter();

    // 生成签名：包含数量 + 最后一条的 text + 最后一条的 preview
    // 参考 quickNavigator: `${messages.length}:${lastText}:${lastPreview}`
    const lastText = newMessages.length ? newMessages[newMessages.length - 1].text : '';
    const lastPreview = newMessages.length ? newMessages[newMessages.length - 1].preview : '';
    const signature = `${newMessages.length}:${lastText}:${lastPreview}`;

    // 如果没有变化，跳过更新
    if (signature === state.lastSignature) return;

    state.lastSignature = signature;

    // 停止观察旧元素
    if (state.intersectionObserver) {
      state.messages.forEach(msg => {
        if (msg.el) {
          state.intersectionObserver.unobserve(msg.el);
        }
      });
    }

    // 更新消息列表
    state.messages = newMessages;

    // 渲染列表
    ns.ui.renderList(state.ui, state.messages, state.activeIndex);

    // 重新绑定点击事件（因为DOM已重建）
    const { list } = state.ui;
    list.removeEventListener('click', handleItemClick);
    list.removeEventListener('keydown', handleKeydown);
    list.addEventListener('click', handleItemClick);
    list.addEventListener('keydown', handleKeydown);

    // 观察新元素
    if (state.intersectionObserver) {
      state.messages.forEach(msg => {
        if (msg.el && msg.el.isConnected) {
          state.intersectionObserver.observe(msg.el);
        }
      });
    }
  }

  /**
   * 处理来自background的消息
   * @param {Object} message
   * @param {Object} sender
   * @param {Function} sendResponse
   */
  function handleMessage(message, sender, sendResponse) {
    if (message.action === 'toggleSidebar') {
      toggleSidebar();
      sendResponse({ success: true });
    } else if (message.action === 'updateSettings') {
      updateSettings(message.settings);
      sendResponse({ success: true });
    }
    return true;
  }

  /**
   * 切换侧边栏显示/隐藏
   */
  function toggleSidebar() {
    state.visible = !state.visible;
    ns.ui.setSidebarVisible(state.ui, state.visible);

    // 保存状态
    ns.utils.setStorage(STORAGE_KEYS.SIDEBAR_VISIBLE, state.visible);
  }

  /**
   * 更新设置
   * @param {Object} newSettings
   */
  async function updateSettings(newSettings) {
    state.settings = { ...state.settings, ...newSettings };

    // 更新UI
    if (state.ui) {
      // 更新位置
      if (newSettings.sidebarPosition) {
        ns.ui.updatePosition(state.ui, newSettings.sidebarPosition);
      }

      // 更新预览显示
      if (newSettings.showPreview !== undefined) {
        state.ui.showPreview = newSettings.showPreview;
        ns.ui.renderList(state.ui, state.messages, state.activeIndex);
      }

      // 更新启用状态
      if (newSettings.enabled !== undefined) {
        if (newSettings.enabled) {
          ns.ui.setSidebarVisible(state.ui, state.visible);
        } else {
          ns.ui.setSidebarVisible(state.ui, false);
        }
      }
    }
  }

  /**
   * 销毁
   */
  function destroy() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    if (state.intersectionObserver) {
      state.intersectionObserver.disconnect();
      state.intersectionObserver = null;
    }

    if (state.darkModeObserver) {
      state.darkModeObserver.disconnect();
      state.darkModeObserver = null;
    }

    chrome.runtime.onMessage.removeListener(handleMessage);

    ns.ui.destroy();

    state.initialized = false;
    state.ui = null;
    state.messages = [];
    state.conversationRoot = null;
    state.lastSignature = '';
  }

  // 导出核心模块
  ns.core = {
    init,
    destroy,
    toggleSidebar,
    updateSettings,
    refreshDirectory,
    getState: () => ({ ...state }),
  };
})();
