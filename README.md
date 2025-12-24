# EdgeMirror - 全球实时协作白板

<div align="center">

![EdgeMirror Logo](frontend/public/favicon.svg)

**毫秒级同步，AI 智能整理，全球协作无界限**

本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![Aliyun ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

[![Powered by Aliyun ESA](https://img.shields.io/badge/Powered%20by-Aliyun%20ESA%20Pages-FF6A00?style=for-the-badge&logo=alibabacloud)](https://www.aliyun.com/product/esa)
[![AI Powered](https://img.shields.io/badge/AI-通义千问-6366F1?style=for-the-badge)](https://tongyi.aliyun.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

[在线体验](#在线体验) | [功能特性](#功能特性) | [技术架构](#技术架构) | [边缘计算应用](#边缘计算应用-how-we-use-edge)

#阿里云ESA Pages #阿里云云工开物

</div>

---

## 项目简介

**EdgeMirror** 是一款基于阿里云 ESA Pages 边缘计算平台构建的全球实时协作白板。它将边缘计算的低延迟优势与 AI 智能分析能力深度结合，为团队协作、在线教学、头脑风暴等场景提供极致流畅的体验。

### 核心亮点

- ⚡ **毫秒级同步** - 基于 ESA 全球边缘节点，多人协作延迟低至 10ms
- 🧠 **AI 智能整理** - 一键将涂鸦转化为专业思维导图，AI 自动分析归类
- 🌍 **全球协作** - 无需注册，分享链接即可开始协作，支持实时光标显示
- 🎨 **极简设计** - 摒弃浮夸渐变，采用高级灰色系，专注内容本身
- 📱 **多端适配** - 完美支持桌面端和移动端，随时随地协作

---

## 功能演示

### 首页 - 创建与加入画板
![首页](screenshots/homepage.png)
*极简主义设计，一键创建或加入协作画板*

### 画板 - 实时协作绘图
![画板](screenshots/board.png)
*多人实时协作，显示协作者光标和操作*

### AI 面板 - 智能分析
![AI面板](screenshots/ai-panel.png)
*AI 智能助手，一键生成思维导图*

### 思维导图 - 结构化展示
![思维导图](screenshots/mindmap.png)
*将画板内容智能转化为结构化思维导图*

---

## 功能特性

### 画板功能

| 功能 | 描述 |
|------|------|
| 🖊️ **自由绘制** | 支持画笔、直线、矩形、圆形等多种绘图工具 |
| 📝 **文字便签** | 添加文字注释和便签，支持多行文本 |
| 🎨 **颜色画笔** | 9 种预设颜色，5 种线条粗细可选 |
| 🔍 **缩放平移** | 支持画布缩放（10%-500%）和自由平移 |
| 💾 **自动保存** | 画板数据自动同步到边缘存储 |
| 📤 **导出图片** | 一键导出画板为 PNG 图片 |

### 协作功能

| 功能 | 描述 |
|------|------|
| 👥 **多人协作** | 支持多人同时编辑同一画板 |
| 🖱️ **光标同步** | 实时显示协作者的光标位置和名称 |
| 🔗 **链接分享** | 分享画板 ID 即可邀请他人加入 |
| 🌐 **全球加速** | ESA 边缘节点就近接入，全球低延迟 |

### AI 功能

| 功能 | 描述 |
|------|------|
| 🧠 **思维导图生成** | AI 分析画板内容，自动生成结构化思维导图 |
| 📊 **智能整理** | 自动对齐、分组和美化画板元素 |
| 📝 **内容总结** | AI 生成画板内容摘要和优化建议 |
| ⚡ **流式响应** | AI 生成过程实时展示，无需等待 |

---

## 技术架构

### 整体架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                          用户浏览器                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React 18 + Vite + TailwindCSS + Framer Motion            │  │
│  │  ├── Canvas 2D 绘图引擎                                    │  │
│  │  ├── Zustand 状态管理 (持久化)                             │  │
│  │  └── 实时协作光标渲染                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      阿里云 ESA Pages                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   全球边缘节点网络                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │  │
│  │  │ 北京节点 │  │ 上海节点 │  │ 新加坡   │  │ 法兰克福 │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    边缘函数 (Edge Functions)                │  │
│  │  ├── /api/edge/info     - 地理位置 & 边缘节点信息          │  │
│  │  ├── /api/board/sync    - 画板数据同步 (边缘 KV)           │  │
│  │  ├── /api/board/cursor  - 协作者光标同步                   │  │
│  │  ├── /api/ai/mindmap    - AI 思维导图生成 (流式)           │  │
│  │  └── /api/ping          - 延迟测量                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    边缘存储 (Edge KV)                       │  │
│  │  ├── board:{id}         - 画板数据                         │  │
│  │  └── collaborators:{id} - 协作者列表                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      阿里云 AI 服务                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │   通义千问 (qwen-turbo)                                     │  │
│  │   - 思维导图结构生成                                        │  │
│  │   - 内容分析与总结                                          │  │
│  │   - 流式响应支持                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 边缘计算应用 (How We Use Edge)

EdgeMirror 深度利用阿里云 ESA 的边缘计算能力，以下是核心应用场景：

### 1. Geo-IP 地理位置感知

```javascript
// functions/edge/info.js
export async function onRequest(context) {
  const { request } = context;

  // 获取 ESA 提供的地理位置信息
  const geoInfo = {
    country: request.headers.get('x-geo-country'),
    city: request.headers.get('x-geo-city'),
    latitude: request.headers.get('x-geo-latitude'),
    longitude: request.headers.get('x-geo-longitude'),
  };

  // 根据地理位置优化用户体验
  // - 显示用户所在位置
  // - 选择最近的边缘节点
  // - 本地化内容展示
}
```

**应用场景**：
- 在画板界面显示协作者的地理位置
- 根据用户位置选择最优边缘节点
- 统计全球协作分布情况

### 2. 边缘 KV 存储

```javascript
// functions/board/sync.js
export async function onRequest(context) {
  const { request, env } = context;
  const { boardId, data } = await request.json();

  // 将画板数据存储到边缘 KV
  await env.BOARD_KV.put(`board:${boardId}`, JSON.stringify(data));

  // 边缘存储的优势：
  // - 全球分布，就近读写
  // - 毫秒级响应
  // - 自动同步
}
```

**应用场景**：
- 画板数据持久化存储
- 协作者状态管理
- 热门模板缓存

### 3. 流式响应 (Streaming)

```javascript
// functions/ai/mindmap.js
export async function onRequest(context) {
  // 调用通义千问 API（流式模式）
  const response = await fetch(QWEN_API_URL, {
    body: JSON.stringify({ stream: true, ... }),
  });

  // 创建流式响应
  const { readable, writable } = new TransformStream();

  // 边缘侧处理流式数据
  // 用户可以实时看到 AI 生成过程
  return new Response(readable, {
    headers: { 'Transfer-Encoding': 'chunked' },
  });
}
```

**应用场景**：
- AI 思维导图实时生成
- 大文件分块传输
- 实时日志输出

### 4. 边缘缓存策略

```javascript
// 静态资源边缘缓存
// - HTML/CSS/JS 文件缓存在边缘节点
// - 首次加载后，后续访问极速响应
// - 全球 CDN 加速

// 动态数据缓存
// - 热门画板模板缓存
// - 常用图标资源缓存
// - API 响应短期缓存
```

### 5. 实时协作同步

```javascript
// 协作者光标同步
// 利用边缘函数的低延迟特性
// 实现毫秒级的光标位置同步

export async function handleCursorUpdate(request, env) {
  const { boardId, userId, position } = await request.json();

  // 更新协作者位置（边缘存储）
  const collaborators = await env.BOARD_KV.get(`collaborators:${boardId}`);
  // ... 更新逻辑

  // 边缘侧处理，延迟 < 10ms
}
```

---

## 项目结构

```
09_EdgeMirror_实时协作白板/
├── frontend/                      # 前端代码
│   ├── src/
│   │   ├── components/           # React 组件
│   │   │   ├── Toolbar.jsx       # 工具栏
│   │   │   ├── Canvas.jsx        # 画布组件
│   │   │   ├── AIPanel.jsx       # AI 面板
│   │   │   └── CollaboratorCursors.jsx  # 协作者光标
│   │   ├── pages/                # 页面
│   │   │   ├── HomePage.jsx      # 首页
│   │   │   ├── BoardPage.jsx     # 画板页
│   │   │   └── MindMapPage.jsx   # 思维导图页
│   │   ├── store/                # 状态管理
│   │   │   └── index.js          # Zustand Store
│   │   ├── utils/                # 工具函数
│   │   │   └── api.js            # API 调用
│   │   ├── App.jsx               # 应用入口
│   │   ├── main.jsx              # 渲染入口
│   │   └── index.css             # 全局样式
│   ├── public/                   # 静态资源
│   │   └── favicon.svg           # 图标
│   ├── index.html                # HTML 模板
│   ├── package.json              # 依赖配置
│   ├── vite.config.js            # Vite 配置
│   ├── tailwind.config.js        # Tailwind 配置
│   └── postcss.config.js         # PostCSS 配置
├── functions/                     # 边缘函数
│   ├── edge/
│   │   └── info.js               # 地理位置信息
│   ├── board/
│   │   └── sync.js               # 画板同步
│   ├── ai/
│   │   └── mindmap.js            # AI 思维导图
│   └── ping.js                   # 延迟测量
├── screenshots/                   # 截图
└── README.md                      # 项目文档
```

---

## 快速开始

### 本地开发

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:5190
```

### 生产部署

1. 在阿里云 ESA 控制台创建 Pages 项目
2. 关联 GitHub 仓库
3. 配置构建命令：
   - 构建命令：`npm install && npm run build`
   - 根目录：`/frontend`
   - 输出目录：`dist`
4. 配置环境变量（可选）：
   - `QWEN_API_KEY`: 通义千问 API Key
5. 部署完成后，ESA 会自动在全球边缘节点同步

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 18 + Vite |
| **样式方案** | TailwindCSS 3 |
| **动画库** | Framer Motion |
| **状态管理** | Zustand (持久化) |
| **路由** | React Router 6 |
| **绘图** | Canvas 2D API |
| **部署平台** | 阿里云 ESA Pages |
| **边缘计算** | ESA Edge Functions |
| **AI 服务** | 通义千问 (qwen-turbo) |

---

## 设计理念

### 避免 "AI 味" 设计

参考 [aura.build](https://www.aura.build/) 的设计理念，本项目刻意避免：

1. ❌ 蓝紫渐变色 → ✅ 高级灰色系 + 点缀色
2. ❌ 滥用 Emoji → ✅ 精心设计的 SVG 图标
3. ❌ 圆角卡片堆叠 → ✅ 简洁的线性布局
4. ❌ 过度动效 → ✅ 克制的微交互

### 色彩系统

- **主色调**: Teal (#0d9488) - 深邃蓝绿，专业稳重
- **强调色**: Amber (#f59e0b) - 琥珀金，温暖点缀
- **中性色**: Stone 系列 - 高级灰，层次分明

---

## 应用场景

1. **团队头脑风暴** - 远程团队实时协作，激发创意
2. **在线教学** - 教师板书，学生实时观看和互动
3. **项目规划** - 绘制流程图，AI 自动整理成思维导图
4. **会议记录** - 实时记录会议要点，自动生成总结
5. **创意设计** - 快速草图，团队评审反馈

---

## 许可证

MIT License

---

<div align="center">

**EdgeMirror** - 让协作无界限

Made with ❤️ for 阿里云 ESA Pages 边缘开发大赛

</div>
