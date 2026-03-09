# Stack Research

**Domain:** 浏览器俯视角竞技射击游戏的 gunfeel / hit confirm 优化
**Researched:** 2026-03-09
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `three` | `0.160.0` | 场景、相机、sprite、材质、动画与渲染 | 当前项目已经在用，且官方 API 已足够支持 hit marker、impact sprite、camera pulse、muzzle flash、tracer 节奏控制，无需为本里程碑迁移框架 |
| Browser Web APIs | Current browser runtime | 输入、动画帧调度、轻量状态持久化 | 现有实现已经依赖 `requestAnimationFrame`、pointer 事件、`localStorage`，命中反馈增强仍可直接建立在浏览器原生能力上 |
| HTML/CSS HUD | Existing | 准星、命中标记、击杀确认、武器状态呈现 | 射手侧命中确认本质上需要 HUD 层与世界层协作，当前项目已有 HUD 容器，增量成本最低 |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `THREE.Sprite` / `THREE.SpriteMaterial` | `0.160.0` | 构建轻量的 hit marker、impact flare、kill confirm sprite | 当反馈需要跟随世界位置或叠加到镜头前层时使用 |
| `THREE.AnimationAction` | `0.160.0` | 保证开火、换弹、受击反应的时序一致性 | 当枪械反馈需要与角色动画权重同步时使用 |
| `THREE.PositionalAudio` | `0.160.0` | 未来如扩到程序化/本地音频时提供空间化能力 | 仅在后续里程碑纳入真正音频反馈时使用；本轮不是必需项 |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Browser DevTools | 观察帧时序、DOM/HUD 刷新与瞬态对象数量 | 当前项目没有构建链，DevTools 是最低成本调试面板 |
| 本地静态 HTTP 服务 | 保证 `assets.json` 与 glTF 通过 HTTP 正常加载 | 现有项目依赖 `fetch('./assets.json')`，不应使用 `file://` 直开验证 |
| Playwright | 后续如要加 smoke test 可作为浏览器自动化基础 | 本轮里程碑不强制引入，只作为后续验证能力候选 |

## Installation

```bash
# No mandatory package changes for v1.0 Gunfeel Pass

# Optional future validation/tooling
npm install -D playwright
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| 保持现有 `three@0.160.0` 直连架构 | 迁移到 `react-three-fiber` | 只有在项目明确转向组件化 UI、需要更强状态管理和多文件工程时才值得考虑 |
| 直接使用 HUD + sprite + camera pulse | `EffectComposer` 全屏后处理链 | 只有当后续里程碑明确需要 bloom、chromatic aberration、film grain 等系统级视觉语言时才考虑 |
| 保持浏览器原生事件与单项目输入层 | 全面引入外部输入/状态框架 | 仅在项目拆成多模块并出现输入状态同步复杂度后再考虑 |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| 在本里程碑顺手引入 bundler / framework migration | 会把“命中确认优化”变成基础设施重构，风险和回归面都过大 | 先在现有栈内拆出枪械反馈边界 |
| 先上全屏后处理再谈命中手感 | 很容易做出“更花”但不更准的反馈，且调试成本高 | 先做好 hit marker、tracer timing、camera pulse、weapon-specific tuning |
| 把外部音频资源管线作为本轮前置 | 用户反馈的核心不是“没有声音素材”，而是“打中了但不知道” | 本轮先做视觉与时序确认，音频后续再加 |

## Stack Patterns by Variant

**If 继续保持当前单文件实现:**
- 使用“集中配置 + 独立反馈函数 + 统一 shot result”模式
- 因为这是最小成本的中等重构，不强迫项目先迁移工程结构

**If 后续拆分为浏览器 ESM 模块:**
- 优先拆 `combat/firearms`、`combat/feedback`、`hud`、`tuning`
- 因为这些边界正好对应本轮里程碑的核心职责

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `three@0.160.0` | `three/addons@0.160.0` | addons 必须与核心版本对齐，当前 import map 已满足 |
| `THREE.SpriteMaterial` | `THREE.Sprite` | 适合实现始终朝向相机的轻量反馈对象 |
| `THREE.PositionalAudio` | `THREE.AudioListener` | 若未来接入音频，listener 通常挂在 camera 上 |

## Sources

- `/mrdoob/three.js` — 查询 `Sprite`, `SpriteMaterial`, `PositionalAudio`, `AudioListener`
- [Three.js Sprite docs](https://threejs.org/docs/#api/en/objects/Sprite) — 验证 sprite 始终朝向相机
- [Three.js SpriteMaterial docs](https://threejs.org/docs/#api/en/materials/SpriteMaterial) — 验证 sprite 材质能力
- [Three.js PositionalAudio docs](https://threejs.org/docs/#api/en/audio/PositionalAudio) — 验证未来音频扩展路径
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — 验证浏览器原生音频能力

---
*Stack research for: browser shooter gunfeel pass*
*Researched: 2026-03-09*
