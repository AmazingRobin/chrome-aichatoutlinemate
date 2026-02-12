/**
 * AI Chat OutlineMate - Background Service Worker
 * 处理扩展生命周期
 */

// 监听扩展安装/更新
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[OutlineMate] Extension installed');

    // 设置默认配置
    chrome.storage.sync.set({
      outlinemate_settings: {
        enabled: true,
        showPreview: true,
        sidebarPosition: 'right',
      }
    });
  } else if (details.reason === 'update') {
    console.log('[OutlineMate] Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// 监听来自popup或content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    chrome.storage.sync.get('outlinemate_settings', (result) => {
      sendResponse(result.outlinemate_settings || {});
    });
    return true; // 保持消息通道开放
  }
});
