# AI Chat OutlineMate

为主流 AI 对话平台生成对话大纲导航，快速回溯，精准定位。

Generate conversation outline navigation for mainstream AI chat platforms — quick backtracking, precise positioning.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 功能特性 / Features

- 自动为 AI 对话生成侧边栏大纲导航
- 点击大纲项即可跳转到对应对话位置
- 滚动时自动高亮当前可见的对话
- 支持显示 AI 回复预览摘要
- 自动适配亮色/深色主题
- 侧边栏收起时仅显示序号，悬停展开完整内容
- 键盘导航支持（方向键、Home/End、Enter）
- 支持中文 / English 双语界面

## 支持平台 / Supported Platforms

| 平台 / Platform | 网址 / URL |
|---|---|
| ChatGPT | chatgpt.com / chat.openai.com |
| Google Gemini | gemini.google.com |
| 豆包 / Doubao | doubao.com |
| Kimi | kimi.moonshot.cn / kimi.com |
| 通义千问 / Qwen | tongyi.aliyun.com / qianwen.com |

## 安装 / Installation

1. 下载或克隆本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目根目录

## 使用 / Usage

安装后访问任意支持的 AI 平台，页面右侧会自动出现对话大纲侧边栏。

- 悬停侧边栏可展开查看完整标题和 AI 回复预览
- 点击任意条目跳转到对应对话
- 通过扩展弹窗可配置：启用/禁用插件、显示/隐藏 AI 回复预览、切换语言

## 项目结构 / Project Structure

```
├── manifest.json              # 扩展配置
├── _locales/                  # 国际化（en / zh_CN）
├── icons/                     # 扩展图标
└── src/
    ├── background/
    │   └── background.js      # Service Worker
    ├── content/
    │   ├── namespace.js       # 全局命名空间与配置
    │   ├── utils.js           # 工具函数
    │   ├── ui.js              # Shadow DOM 侧边栏 UI
    │   ├── core.js            # 核心逻辑（初始化、观察者、事件）
    │   ├── index.js           # 内容脚本入口
    │   └── adapters/          # 平台适配器
    │       ├── index.js       # 适配器注册与平台检测
    │       ├── chatgpt.js
    │       ├── gemini.js
    │       ├── doubao.js
    │       ├── kimi.js
    │       └── qwen.js
    └── popup/
        ├── popup.html         # 弹窗界面
        ├── popup.js           # 弹窗逻辑
        └── popup.css          # 弹窗样式
```

## 技术要点 / Technical Highlights

- Manifest V3 Chrome Extension
- Shadow DOM 隔离样式，避免与宿主页面冲突
- 适配器模式支持多平台扩展
- MutationObserver 监听 DOM 变化自动更新大纲
- IntersectionObserver 追踪滚动位置高亮当前对话
- Chrome Storage Sync 跨设备同步设置
