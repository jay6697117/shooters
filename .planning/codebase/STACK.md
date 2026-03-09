# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**
- JavaScript (ES modules; exact spec level Not detected) - `index.html` 中 `<script type="module">` 内承载全部主要应用逻辑

**Secondary:**
- HTML5 - `index.html` 提供页面骨架、HUD 容器、`<script type="importmap">` 和模块入口
- CSS3 - `index.html` 内联样式负责整体 UI、HUD、菜单和响应式布局
- JSON - `assets.json` 作为本地资产清单，索引角色、武器和场景 glTF 路径

## Runtime

**Environment:**
- Web browser - 主运行时；代码依赖 DOM、Canvas、WebGL、`fetch`、`localStorage`、`requestAnimationFrame`
- Browser version: Not detected

**Package Manager:**
- Not detected at repo root
- Lockfile: Not detected

## Frameworks

**Core:**
- Three.js 0.160.0 - 负责 3D 场景、相机、灯光、渲染、数学工具和动画系统
- `GLTFLoader` from `three/addons` 0.160.0 - 加载本地 glTF 角色、武器、环境模型
- `SkeletonUtils` from `three/addons` 0.160.0 - 克隆带骨骼和动画数据的 glTF 实例

**Testing:**
- Not detected - 仓库根目录未发现自动化测试框架、测试配置或测试脚本

**Build/Dev:**
- Not detected - 未发现 bundler、transpiler、package-based dev server 或编译步骤

## Key Dependencies

**Critical:**
- `three` 0.160.0 - 整个游戏运行时的核心渲染与场景管理依赖
- `three/addons/loaders/GLTFLoader.js` 0.160.0 - 资产预加载和运行时模型加载入口
- `three/addons/utils/SkeletonUtils.js` 0.160.0 - 角色、武器等可复用模型实例化所需
- Local `assets.json` manifest - 本地资产索引，驱动预加载请求和资源路径解析

**Infrastructure:**
- Browser Web APIs - 输入事件、存储、动画帧调度和网络请求全部依赖浏览器原生能力
- Google Fonts CSS import - `Bangers`、`Barlow Condensed`、`Barlow` 字体由远程样式表提供

## Configuration

**Environment:**
- No environment variables detected
- 主要运行时配置以内联常量形式存在于 `index.html`，包括 `BASE_ARENA`、`CONFIG` 及若干 UI/玩法默认值
- 玩家视觉模式、最佳通关时间和 AI 难度覆盖值写入浏览器 `localStorage`

**Build:**
- Not detected - 仓库根目录未发现 `package.json`、lockfile、构建配置、CI 配置或测试配置
- 模块解析依赖 `index.html` 内的 `<script type="importmap">`
- 资产发现依赖本地 `assets.json`

## Platform Requirements

**Development:**
- 任意可运行现代浏览器的开发平台
- 需要浏览器支持 ES modules、WebGL、`fetch` 和 `localStorage`
- 基于代码中 `fetch('./assets.json')` 与相对 glTF 加载路径，推断更适合通过静态 HTTP 服务运行，而不是直接使用 `file://`

**Production:**
- 任意可静态托管 `index.html`、`assets.json`、`assets/` 和 `favicon.ico` 的平台
- No backend or server runtime detected
- 若不改为本地 vendoring，运行时需要可访问 `unpkg.com` 与 `fonts.googleapis.com`

---

*Stack analysis: 2026-03-09*
*Update after major dependency changes*
