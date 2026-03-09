# Architecture

**Analysis Date:** 2026-03-09

## 模式概览

**Overall:** 单入口静态浏览器游戏，采用 `index.html` 中单个 `<script type="module">` 的脚本式 monolith。

**关键特征：**
- 浏览器页面壳、Three.js 渲染、输入、资源加载、比赛状态、AI、HUD 与特效全部集中在 `index.html`
- 页面通过 `importmap` 直接从 CDN 引入 `three` 与 `three/addons/`，未检测到构建产物或源码拆分目录
- 运行时状态以多个全局可变对象保存：`state`、`settings`、`fx`、`assets`、`world`、`input`
- 资源由 `assets.json` 清单驱动，GLTF 加载失败或手动切换时会回退到 placeholder mesh
- 未检测到后端、数据库、认证链路或 API 集成；持久化仅使用 `localStorage`

## 层次

**页面壳与 HUD 层：**
- Purpose: 提供浏览器页面结构、HUD 容器、菜单和覆盖层
- Contains: `#canvasWrap`、`#hud`、`#menuOverlay`、`#pauseOverlay`、`#matchOverlay`、`#leaderboardOverlay`、内联 `<style>`
- Depends on: 浏览器 DOM、CSS
- Used by: `document.getElementById(...)` DOM 缓存、`buildPlayerPanels()`、`updateHUD()`、`showBanner()`

**启动与配置层：**
- Purpose: 完成常量配置、DOM 绑定、本地偏好恢复和启动顺序编排
- Contains: `CONFIG`、`COLORS`、`SPAWN_POINTS`、`state`、`settings`、`fx`、`assets`、`world`、`init()`
- Depends on: 页面壳与 HUD 层、`three`
- Used by: 所有运行期逻辑

**资产与视觉适配层：**
- Purpose: 读取资源清单、预加载 GLTF、在 `gltf` 与 `placeholder` 视觉表示之间切换
- Contains: `loadAssets()`、`loadGltf()`、`cloneAsset()`、`markPlaceholder()`、`swapAllVisuals()`、`ensure*Visual()`、`swap*Visual()`、`normalizeToHeight()`、`findBuiltInWeapons()`
- Depends on: `assets.json`、`GLTFLoader`、`SkeletonUtils`、`settings.usePlaceholders`
- Used by: `buildArena()`、`spawnEntities()`、`spawnWeaponPickup()`、`spawnGrenade()`、视觉切换按钮

**世界构建层：**
- Purpose: 依据模式与资源清单构造场景内容、障碍、爆炸桶、导航节点和角色
- Contains: `applyGameMode()`、`clearArena()`、`buildArena()`、`spawnBarrels()`、`buildCoverNodes()`、`spawnEntities()`、`createCharacter()`、`createWeaponLoadout()`
- Depends on: 启动与配置层、资产与视觉适配层
- Used by: `init()`、`startMatch()`、模式切换与回合重置

**对局模拟层：**
- Purpose: 推进每帧游戏状态，包括玩家控制、AI 决策、碰撞、武器、伤害、回合与比赛结算
- Contains: `animate()`、`updateGame()`、`updatePlayer()`、`updateAI()`、`decideAI()`、`applyMovement()`、`attemptFire()`、`startReload()`、`applyDamage()`、`explodeBarrel()`、`explodeGrenade()`、`endRound()`、`endMatch()`
- Depends on: 前述所有层
- Used by: `requestAnimationFrame(animate)` 驱动的主循环

**表现与镜头层：**
- Purpose: 将模拟状态映射为 HUD、弹道、粒子、屏幕闪烁、镜头运动和 kill cam 演出
- Contains: `updateHUD()`、`updateLeaderboard()`、`spawnPopup()`、`updatePopups()`、`spawnTracer()`、`updateTracers()`、`updateParticles()`、`updateCameraFx()`、`triggerKillCam()`、`updateKillCam()`
- Depends on: 页面壳与 HUD 层、对局模拟层、`THREE.Scene`/`THREE.Camera`
- Used by: 主循环和命中/击杀事件

## 数据流

页面加载后，逻辑并不是通过模块装配，而是沿着单文件脚本从上到下初始化，再进入长期运行的帧循环。

**应用启动：**

1. 浏览器加载 `index.html`
2. `importmap` 解析 `three` 与 `three/addons/` 远程模块
3. 模块脚本创建常量、DOM 引用和全局状态容器
4. 从 `localStorage` 恢复视觉模式、最佳成绩和 AI 难度
5. `init()` 依次调用 `setupRenderer()`、`setupScene()`、`setupCamera()`、`setupLights()`、`bindInput()`
6. `loadAssets()` 读取 `./assets.json` 并预加载主要 GLTF 资源
7. `applyGameMode(state.gameMode)` 根据当前模式重建 arena、角色和 HUD
8. `setMode('menu')` 显示主菜单
9. `animate()` 启动永久帧循环

**比赛帧循环：**

1. `requestAnimationFrame(animate)` 触发下一帧
2. `world.clock.getDelta()` 计算 `dt`
3. `updateFxTimers(dt)` 更新慢动作、闪屏、镜头特效计时器
4. 根据 `state.mode` 选择 `updateKillCam(dt)`、`updateGame(dt)` 或 `updateIdle(dt)`
5. 更新 mixers、tracers、sprites、particles 与相机
6. 清理 `input.mouse.justPressed`
7. `world.renderer.render(world.scene, world.camera)` 输出画面

**一次攻击结算：**

1. 键鼠输入或 AI 决策触发 `attemptFire()`、`tryThrowGrenade()` 或 `tryKick()`
2. 武器逻辑读取 `entity.weapon`、`CONFIG.weapons`、冷却与装弹状态
3. 命中检测通过 `findCoverHit()`、`findClosestPlayerHit()`、`findBarrelHit()`、`segmentAABB()`、`segmentCircle()` 计算
4. 命中后分派到 `applyDamage()`、`applyCoverDamage()`、`applyBarrelDamage()` 或 `explodeGrenade()`
5. 表现层追加 tracer、muzzle、flash、popup、shake、kill cam 等演出
6. 回合与比赛状态通过 `endRound()` / `endMatch()` 更新 HUD 与 overlay

**状态管理：**
- 主要状态全部驻留内存，没有独立状态管理器或不可变数据层
- 共享容器由 `state` 管比赛流程、`world` 管 Three.js 对象与实体集合、`assets` 管资源缓存、`input` 管输入快照
- 长久偏好仅落到 `localStorage`：`tinyToonDuel_visualMode`、`tinyToonDuel_bestWinSeconds`、`tinyToonDuel_aiDifficultyByMode`

## 关键抽象

**`CONFIG`：**
- Purpose: 统一保存渲染、相机、武器、模式、AI、道具与物理调参
- Examples: `CONFIG.weapons`、`CONFIG.gameModes`、`CONFIG.cover.types`、`CONFIG.grenade`
- Pattern: 只读配置注册表，运行时少量字段会被 `applyGameMode()` 动态改写

**`state`：**
- Purpose: 保存比赛流程和 UI 状态机
- Examples: `mode`、`gameMode`、`timeLeft`、`wins`、`roundResults`、`matchEnded`、`killCam`
- Pattern: 单例式可变会话状态对象

**`world`：**
- Purpose: 聚合场景对象、实体列表、碰撞对象和短生命周期特效
- Examples: `scene`、`camera`、`renderer`、`entities`、`cover`、`barrels`、`pickups`、`fxLines`
- Pattern: 运行期 registry / service locator

**实体记录 `entity`：**
- Purpose: 表示玩家或 AI 角色的全部运行期数据
- Examples: `createCharacter()` 返回的对象，包含 `position`、`velocity`、`weapon`、`mixers`、`isAI`、`ai`
- Pattern: 数据记录 + 过程函数组合，而非 class

**双视觉表示 `visuals`：**
- Purpose: 给实体、掩体、爆炸桶、拾取物、手雷和装饰同时维护 `gltf` 与 `placeholder` 两套表现
- Examples: `entity.visuals`、`cover.visuals`、`barrel.visuals`、`pickup.visuals`
- Pattern: fallback wrapper，配合 `activeVisual` 做热切换

**`hudPanels`：**
- Purpose: 维护实体 ID 到 HUD DOM 节点的映射缓存
- Examples: `hudPanels.set(entity.id, { panel, hpBar, ... })`
- Pattern: 视图缓存表

## 入口点

**浏览器页面入口：**
- Location: `index.html`
- Triggers: 浏览器打开页面
- Responsibilities: 加载 HTML/CSS、解析 `importmap`、执行模块脚本

**初始化入口：**
- Location: `index.html` 中的 `init()`
- Triggers: 模块顶层最后直接调用 `init()`
- Responsibilities: 建立 renderer/scene/camera/light、绑定输入、加载资源、应用模式、启动循环

**比赛启动入口：**
- Location: `index.html` 中的 `startMatch()`
- Triggers: 菜单中按 `Enter`，或比赛结束后 rematch
- Responsibilities: 重置回合与实体状态、切换 HUD 模式、进入 `playing`

**持续更新入口：**
- Location: `index.html` 中的 `animate()`
- Triggers: `requestAnimationFrame`
- Responsibilities: 驱动整个模拟、特效与渲染

## 错误处理

**Strategy:** 以 guard clause 和 graceful degradation 为主，资源加载失败时尽量继续运行，未检测到统一异常边界或错误上报。

**Patterns:**
- `loadGltf()` 在加载失败时返回 `{ failed: true }`，后续 `cloneAsset()` 返回 `null`，再由 placeholder geometry 接管
- `JSON.parse(localStorage)` 读取 AI 难度时使用 `try { ... } catch {}` 静默容错
- 大量函数在对象不存在、状态不匹配或数值无效时直接 `return`
- 清理函数如 `clearArena()`、`resetBarrels()`、`updateTracers()` 会主动移除 Three.js 对象并 `dispose()` 资源，避免悬挂引用

## 跨层关注点

**Logging：**
- Not detected

**Validation：**
- 主要依赖轻量运行时检查，例如 `setGameMode()`、`setDifficultyForMode()`、`requestWeaponSwitch()`、`startReload()`

**Persistence：**
- 仅使用 `localStorage` 保存视觉模式、最佳战绩和各模式 AI 难度

**输入映射：**
- `bindInput()` 直接在 `window` 上注册键盘与指针事件，并把结果写入共享 `input`

**资源与内存管理：**
- 临时 FX 对象和被替换 mesh 通过 `world` 数组追踪，生命周期结束时手动从 scene 中移除并释放材质/几何体

**Authentication：**
- Not applicable

---

*Architecture analysis: 2026-03-09*
*Update when major patterns change*
