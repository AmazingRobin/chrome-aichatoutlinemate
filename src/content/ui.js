/**
 * AI Chat OutlineMate - UI组件和样式
 */
(() => {
  'use strict';

  const ns = window.OutlineMate;
  const { CONFIG } = ns;

  // CSS样式
  const styles = `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* CSS变量 - 亮色主题 */
    .outlinemate-container {
      --om-bg-color: rgba(255, 255, 255, 0.98);
      --om-bg-hover: rgba(245, 245, 245, 0.98);
      --om-text-color: #333;
      --om-text-secondary: #666;
      --om-text-muted: #999;
      --om-border-color: rgba(0, 0, 0, 0.08);
      --om-active-color: #cf2d2a;
      --om-active-bg: rgba(207, 45, 42, 0.08);
      --om-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      --om-indicator-color: #ccc;
      --om-scrollbar-color: rgba(0, 0, 0, 0.2);
    }

    /* 深色主题 */
    .outlinemate-container.om-dark {
      --om-bg-color: rgba(32, 33, 35, 0.98);
      --om-bg-hover: rgba(45, 46, 48, 0.98);
      --om-text-color: #e5e5e5;
      --om-text-secondary: #aaa;
      --om-text-muted: #777;
      --om-border-color: rgba(255, 255, 255, 0.1);
      --om-active-color: #ff6659;
      --om-active-bg: rgba(255, 102, 89, 0.15);
      --om-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      --om-indicator-color: #555;
      --om-scrollbar-color: rgba(255, 255, 255, 0.2);
    }

    /* 容器 */
    .outlinemate-container {
      position: fixed;
      top: 0;
      bottom: 0;
      width: ${CONFIG.sidebarWidth}px;
      z-index: 2147483647;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .outlinemate-container.om-right {
      right: 0;
    }

    .outlinemate-container.om-left {
      left: 0;
    }

    .outlinemate-container.om-hidden {
      opacity: 0;
      pointer-events: none !important;
    }

    /* 侧边栏 */
    .om-sidebar {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: ${CONFIG.collapsedWidth}px;
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      background: var(--om-bg-color);
      border: 1px solid var(--om-border-color);
      border-radius: 12px;
      pointer-events: auto;
      transition:
        width 0.3s ease,
        filter 0.3s ease,
        background-color 0.3s ease;
      overflow: hidden;
    }

    .om-sidebar:hover {
      width: calc(100% - 16px);
      filter: drop-shadow(var(--om-shadow));
    }

    /* 右侧定位 */
    .om-right .om-sidebar {
      right: 20px;
    }

    /* 左侧定位 */
    .om-left .om-sidebar {
      left: 8px;
    }

    /* 列表容器 */
    .om-list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: var(--om-scrollbar-color) transparent;
    }

    .om-list::-webkit-scrollbar {
      width: 6px;
    }

    .om-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .om-list::-webkit-scrollbar-thumb {
      background: var(--om-scrollbar-color);
      border-radius: 3px;
    }

    /* 列表项 */
    .om-item {
      display: flex;
      align-items: flex-start;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      position: relative;
    }

    .om-item + .om-item {
      border-top: 1px solid var(--om-border-color);
    }

    .om-item:hover {
      background: var(--om-bg-hover);
    }

    .om-item.om-active {
      background: var(--om-active-bg);
    }

    /* 指示器 */
    .om-indicator {
      flex-shrink: 0;
      width: 14px;
      height: 100%;
      min-height: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 4px;
    }

    .om-indicator::after {
      content: '';
      display: block;
      width: 12px;
      height: 3px;
      background: var(--om-active-color);
      border-radius: 2px;
      transition: all 0.2s ease;
      opacity: 0;
    }

    .om-sidebar:hover .om-indicator::after {
      opacity: 0.6;
    }

    .om-item.om-active .om-indicator::after {
      width: 16px;
      height: 4px;
      background: var(--om-active-color);
      opacity: 0;
    }

    .om-sidebar:hover .om-item.om-active .om-indicator::after {
      opacity: 1;
    }

    .om-item:hover .om-indicator::after {
      opacity: 1;
    }

    /* 内容区域 */
    .om-content {
      flex: 1;
      min-width: 0;
      padding-left: 8px;
      padding-right: 36px;
      opacity: 0;
      transition: opacity 0.2s ease 0.1s;
    }

    .om-sidebar:hover .om-content {
      opacity: 1;
    }

    /* 标题 */
    .om-title {
      color: var(--om-text-color);
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .om-item.om-active .om-title {
      color: var(--om-active-color);
    }

    /* 预览 */
    .om-preview {
      color: var(--om-text-muted);
      font-size: 12px;
      line-height: 1.4;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 空状态 */
    .om-empty {
      padding: 24px 16px;
      text-align: center;
      color: var(--om-text-muted);
      font-size: 13px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s ease 0.1s;
    }

    .om-sidebar:hover .om-empty {
      opacity: 1;
    }

    /* 无障碍 - 焦点样式 */
    .om-item:focus {
      outline: 2px solid var(--om-active-color);
      outline-offset: -2px;
    }

    .om-item:focus:not(:focus-visible) {
      outline: none;
    }

    /* 序号标记 - 收起时显示在右侧可见区域 */
    .om-index {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--om-active-color);
      font-size: 10px;
      font-weight: 600;
      opacity: 1;
      transition: opacity 0.2s ease;
      width: 24px;
      text-align: center;
    }

    .om-item.om-active .om-index {
      font-weight: 700;
    }

    /* 展开时序号变淡 */
    .om-sidebar:hover .om-index {
      opacity: 0.4;
      color: var(--om-text-muted);
    }
  `;

  /**
   * 创建Shadow DOM容器
   * @returns {ShadowRoot}
   */
  function createShadowContainer() {
    // 检查是否已存在
    let host = document.getElementById('outlinemate-root');
    if (host) {
      return host.shadowRoot;
    }

    // 创建host元素
    host = document.createElement('div');
    host.id = 'outlinemate-root';
    document.body.appendChild(host);

    // 创建Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });

    // 注入样式
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadow.appendChild(styleEl);

    return shadow;
  }

  /**
   * 创建侧边栏UI
   * @param {Object} options
   * @returns {Object} UI元素引用
   */
  function createSidebar(options = {}) {
    const {
      position = 'right',
      isDark = false,
      showPreview = true,
    } = options;

    const shadow = createShadowContainer();

    // 清除旧内容（保留style）
    const existingContainer = shadow.querySelector('.outlinemate-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 创建容器
    const container = document.createElement('div');
    container.className = `outlinemate-container om-${position}`;
    if (isDark) {
      container.classList.add('om-dark');
    }

    // 创建侧边栏
    const sidebar = document.createElement('div');
    sidebar.className = 'om-sidebar';
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', chrome.i18n.getMessage('outlineNavigation') || 'Conversation Outline Navigation');

    // 创建列表
    const list = document.createElement('div');
    list.className = 'om-list';
    list.setAttribute('role', 'list');

    // 空状态
    const empty = document.createElement('div');
    empty.className = 'om-empty';
    empty.textContent = chrome.i18n.getMessage('noConversation') || 'No conversations';
    list.appendChild(empty);

    sidebar.appendChild(list);
    container.appendChild(sidebar);
    shadow.appendChild(container);

    return {
      shadow,
      container,
      sidebar,
      list,
      showPreview,
    };
  }

  /**
   * 渲染列表项
   * @param {Object} ui - UI元素引用
   * @param {Array} messages - 消息数组
   * @param {number} activeIndex - 当前激活项索引
   */
  function renderList(ui, messages, activeIndex = -1) {
    const { list, showPreview } = ui;

    // 清空列表
    list.innerHTML = '';

    if (!messages || messages.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'om-empty';
      empty.textContent = chrome.i18n.getMessage('noConversation') || 'No conversations';
      list.appendChild(empty);
      return;
    }

    // 渲染每个消息
    messages.forEach((msg, index) => {
      const item = document.createElement('div');
      item.className = 'om-item';
      if (index === activeIndex) {
        item.classList.add('om-active');
      }
      item.setAttribute('role', 'listitem');
      item.setAttribute('tabindex', '0');
      item.setAttribute('data-index', index);
      item.setAttribute('aria-label', chrome.i18n.getMessage('messageAriaLabel', [String(index + 1), msg.title]) || `Message ${index + 1}: ${msg.title}`);

      // 指示器
      const indicator = document.createElement('div');
      indicator.className = 'om-indicator';

      // 内容区
      const content = document.createElement('div');
      content.className = 'om-content';

      // 标题
      const title = document.createElement('div');
      title.className = 'om-title';
      title.textContent = msg.title;

      content.appendChild(title);

      // 预览（如果启用且有内容）
      if (showPreview && msg.preview) {
        const preview = document.createElement('div');
        preview.className = 'om-preview';
        preview.textContent = msg.preview;
        content.appendChild(preview);
      }

      // 序号
      const indexEl = document.createElement('div');
      indexEl.className = 'om-index';
      indexEl.textContent = `#${index + 1}`;

      item.appendChild(indicator);
      item.appendChild(content);
      item.appendChild(indexEl);
      list.appendChild(item);
    });
  }

  /**
   * 更新激活项
   * @param {Object} ui - UI元素引用
   * @param {number} activeIndex - 激活项索引
   */
  function updateActiveItem(ui, activeIndex) {
    const { list } = ui;
    const items = list.querySelectorAll('.om-item');

    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add('om-active');
      } else {
        item.classList.remove('om-active');
      }
    });
  }

  /**
   * 更新深色模式
   * @param {Object} ui - UI元素引用
   * @param {boolean} isDark
   */
  function updateDarkMode(ui, isDark) {
    const { container } = ui;
    if (isDark) {
      container.classList.add('om-dark');
    } else {
      container.classList.remove('om-dark');
    }
  }

  /**
   * 显示/隐藏侧边栏
   * @param {Object} ui - UI元素引用
   * @param {boolean} visible
   */
  function setSidebarVisible(ui, visible) {
    const { container } = ui;
    if (visible) {
      container.classList.remove('om-hidden');
    } else {
      container.classList.add('om-hidden');
    }
  }

  /**
   * 更新侧边栏位置
   * @param {Object} ui - UI元素引用
   * @param {string} position - 'left' | 'right'
   */
  function updatePosition(ui, position) {
    const { container } = ui;
    container.classList.remove('om-left', 'om-right');
    container.classList.add(`om-${position}`);
  }

  /**
   * 销毁UI
   */
  function destroy() {
    const host = document.getElementById('outlinemate-root');
    if (host) {
      host.remove();
    }
  }

  // 导出UI模块
  ns.ui = {
    createShadowContainer,
    createSidebar,
    renderList,
    updateActiveItem,
    updateDarkMode,
    setSidebarVisible,
    updatePosition,
    destroy,
  };
})();
