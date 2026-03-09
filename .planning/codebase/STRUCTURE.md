# Codebase Structure

**Analysis Date:** 2026-03-09

## 目录布局

```text
shooters/
├── .claude/                     # Claude-side agents, commands, templates
├── .codex/                      # Codex-side agents, workflows, skills, templates
│   └── get-shit-done/           # GSD references, workflows, and document templates
├── .planning/                   # Planning artifacts
│   ├── codebase/                # Generated codebase mapping documents
│   └── config.json              # GSD planning configuration
├── assets/                      # Runtime game art pack
│   └── toonshooter/             # Characters, Environment, Guns, Texture assets
├── assets.json                  # Asset manifest loaded at runtime
├── favicon.ico                  # Browser icon
├── index.html                   # Single HTML shell, CSS, and module script
└── .gitignore                   # Ignore rules
```

## 目录用途

**`assets/`：**
- Purpose: 存放游戏运行时直接读取的美术资源
- Contains: `*.gltf`、纹理图片、按资源包类别划分的子目录
- Key files: `assets/toonshooter/Characters/glTF/Character_Soldier.gltf`、`assets/toonshooter/Environment/glTF/Tank.gltf`、`assets/toonshooter/Guns/glTF/Shotgun.gltf`
- Subdirectories: `Characters/`、`Environment/`、`Guns/`、`Texture/`

**`assets/toonshooter/Characters/glTF/`：**
- Purpose: 角色模型资源目录
- Contains: 玩家与敌人角色 GLTF 文件
- Key files: `Character_Soldier.gltf`、`Character_Enemy.gltf`、`Character_Hazmat.gltf`
- Subdirectories: Not detected

**`assets/toonshooter/Environment/glTF/`：**
- Purpose: arena 掩体、装饰物、爆炸桶、围栏等环境模型目录
- Contains: `Tank`、`Barrier_*`、`Crate`、`Sofa`、`Fence_Long` 等 GLTF 文件
- Key files: `Tank.gltf`、`Barrier_Large.gltf`、`ExplodingBarrel.gltf`、`ExplodingBarrel_Spilled.gltf`
- Subdirectories: Not detected

**`assets/toonshooter/Guns/glTF/`：**
- Purpose: 武器和投掷物模型目录
- Contains: `Pistol`、`SMG`、`Shotgun`、`Grenade` 等 GLTF 文件
- Key files: `Pistol.gltf`、`SMG.gltf`、`Shotgun.gltf`、`Grenade.gltf`
- Subdirectories: Not detected

**`.planning/`：**
- Purpose: GSD 工作流生成的规划与映射产物目录
- Contains: `config.json`、`codebase/` 以及后续规划文档
- Key files: `.planning/config.json`
- Subdirectories: `codebase/`

**`.planning/codebase/`：**
- Purpose: 代码库地图文档输出目录
- Contains: `ARCHITECTURE.md`、`STRUCTURE.md` 以及其他映射文档
- Key files: `.planning/codebase/ARCHITECTURE.md`、`.planning/codebase/STRUCTURE.md`
- Subdirectories: Not detected

**`.codex/`：**
- Purpose: Codex 侧的代理、技能、模板、工作流与配置
- Contains: agent definitions、`get-shit-done/`、skills、`config.toml`
- Key files: `.codex/config.toml`、`.codex/get-shit-done/workflows/map-codebase.md`
- Subdirectories: `agents/`、`get-shit-done/`、`skills/`

**`.claude/`：**
- Purpose: Claude 侧的并行配置副本，结构与 `.codex/` 类似
- Contains: agents、commands、GSD templates/workflows、settings
- Key files: `.claude/agents/gsd-codebase-mapper.md`、`.claude/package.json`
- Subdirectories: `agents/`、`commands/`、`get-shit-done/`、`skills/`

## 关键文件位置

**入口点：**
- `index.html`: 浏览器唯一应用入口，包含 HTML、CSS 和全部模块脚本

**配置：**
- `assets.json`: 运行时资源清单，按 `characters`、`guns`、`environment` 建立逻辑名称到资源路径的映射
- `.planning/config.json`: GSD 规划与并行化配置
- `.codex/config.toml`: Codex 侧 GSD/agent 配置
- `.gitignore`: Git 忽略规则

**核心逻辑：**
- `index.html`: 所有渲染、状态、输入、AI、武器、HUD、FX 和主循环逻辑
- `assets/toonshooter/...`: `index.html` 运行时装配的模型与纹理资源

**测试：**
- Not detected

**文档：**
- `.planning/codebase/*.md`: 代码库映射结果
- `.codex/get-shit-done/templates/codebase/architecture.md`: `ARCHITECTURE.md` 模板来源
- `.codex/get-shit-done/templates/codebase/structure.md`: `STRUCTURE.md` 模板来源

## 命名约定

**文件：**
- 根目录运行文件使用小写简单命名，例如 `index.html`、`assets.json`、`favicon.ico`
- 资源文件沿用资源包原始命名，常见形态为 `PascalCase` + 下划线，例如 `Character_Soldier.gltf`、`Barrier_Large.gltf`
- 规划映射文档使用全大写文件名，例如 `ARCHITECTURE.md`、`STRUCTURE.md`

**目录：**
- 工作流与工程目录使用小写，例如 `assets`、`.planning`、`.codex`、`.claude`
- 资源包类别保留上游命名风格，例如 `Characters`、`Environment`、`Guns`、`Texture`

**特殊模式：**
- 主应用源码采用单文件模式，核心实现集中在 `index.html` 的 `<script type="module">`
- 资源访问优先通过 `assets.json` 的逻辑 key 间接定位，而不是在多个函数中重复硬编码路径
- `src/`、`tests/`、`package.json`、独立模块导出目录均未检测到

## 新代码应该放在哪里

**新玩法或规则：**
- Primary code: `index.html` 中与相关职责相邻的函数簇，例如输入、武器、AI、HUD、FX 区段
- Tests: Not detected
- Config if needed: `CONFIG` 常量区，资源仍通过 `assets.json` 注册

**新资源驱动对象：**
- Implementation: 将模型文件放入 `assets/toonshooter/Characters/glTF/`、`assets/toonshooter/Environment/glTF/` 或 `assets/toonshooter/Guns/glTF/`
- Manifest registration: `assets.json`
- Runtime hookup: `loadAssets()`、`buildArena()`、`spawnEntities()`、`createPickupMesh()`、`createGrenadeMesh()` 等 `index.html` 内函数

**新 HUD 或菜单元素：**
- Implementation: `index.html` 的 HTML 结构与内联 CSS
- Runtime wiring: `document.getElementById(...)` 缓存区、`buildPlayerPanels()`、`updateHUD()` 或 overlay 相关函数
- Tests: Not detected

**共享工具逻辑：**
- Shared helpers: 当前仍放在 `index.html` 辅助函数区，例如 `computeMeshBounds()`、`segmentAABB()`、`formatTime()`
- Type definitions: Not applicable
- Separate utility module: Not detected

## 特殊目录

**`.planning/codebase/`：**
- Purpose: 由 `gsd-map-codebase` 工作流生成的代码库地图文档
- Source: `.codex/get-shit-done/workflows/map-codebase.md` 与 `.codex/get-shit-done/templates/codebase/*.md`
- Committed: Yes，`.gitignore` 未忽略 `.planning/`

**`.codex/get-shit-done/`：**
- Purpose: Codex 侧 GSD 的工作流、模板、引用文档与脚本源码
- Source: 仓库内维护的工作流资源
- Committed: Yes

**`.claude/get-shit-done/`：**
- Purpose: Claude 侧 GSD 资源副本，便于另一套代理运行时使用
- Source: 仓库内维护的工作流资源
- Committed: Yes

**`assets/toonshooter/`：**
- Purpose: 游戏实际消费的第三方内容包目录
- Source: 本地静态资源，运行时由 `assets.json` 清单引用
- Committed: Yes

---

*Structure analysis: 2026-03-09*
*Update when directory structure changes*
