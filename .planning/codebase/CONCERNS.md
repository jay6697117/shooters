# Codebase Concerns

**Analysis Date:** 2026-03-09

## 技术债务

**`index.html` 单文件承载全部主逻辑:**
- Issue: `index.html` 共有 `5332` 行，样式、DOM、配置、渲染、输入、资产装载、AI、碰撞和 HUD 更新都集中在一个 `<script type="module">` 中；静态统计约有 `198` 个函数式定义。
- Files: `index.html:1-5332`
- Why: 当前仓库未检测到构建工具或模块化脚手架，单文件实现是最快落地路径。
- Impact: 改动的爆炸半径非常大；一个局部修复很容易波及渲染、输入、UI 和玩法状态；代码审阅、回归定位和后续拆分成本都会持续上升。
- Fix approach: 将 `index.html` 降为页面壳；优先拆出 `config`、`assets`、`state`、`ui/hud`、`combat`、`arena` 等 ES modules；先把纯逻辑和 DOM 操作分层，再考虑是否引入 bundler。

**资产清单存在“双源真相”:**
- Issue: `assets.json` 索引了 `74` 个本地资产，但 `loadAssets()` 仍在 `index.html` 里手工枚举要预加载的路径子集。
- Files: `assets.json`, `index.html:1296-1335`
- Why: 现在的实现希望只加载当前玩法真正用到的模型，避免把全部资产都拉进启动阶段。
- Impact: 资产名一旦重命名、迁移或新增，`assets.json` 与 `loadAssets()` 很容易漂移；失败时又会静默回退为 `null`/placeholder，问题不容易第一时间暴露。
- Fix approach: 把“预加载分组”也并入 `assets.json` 或生成型清单；至少在启动时校验 manifest 引用完整性，并对缺失资产输出显式错误。

**共享可变全局状态过多:**
- Issue: `state`、`settings`、`fx`、`assets`、`world`、`input` 都是同一模块内的可变单例，且大量函数直接读写这些对象。
- Files: `index.html:1034-1109`, `index.html:2834-5205`
- Why: 对于原型期浏览器游戏，这是最直接的实现方式。
- Impact: 初始化顺序、重置顺序和模式切换顺序都会变得脆弱；局部功能很难被单独验证；后续引入新模式或新武器时，容易出现隐藏耦合。
- Fix approach: 先把“状态变更”和“副作用执行”分开；为 round reset、match reset、asset swap 这类流程建立明确的生命周期函数；逐步减少跨系统直接写共享对象。

## 已知问题

**静态代码审查下未发现可直接确认的运行时 bug:**
- Symptoms: Not detected
- Trigger: Not detected
- Workaround: Not applicable
- Root cause: 本次 mapping 仅做静态阅读，未运行浏览器回归或自动化脚本。
- Blocked by: 仓库内未检测到自动化测试或 smoke test harness

## 安全注意事项

**运行时依赖第三方 CDN 脚本:**
- Risk: `three`、`GLTFLoader` 和 `SkeletonUtils` 通过 `https://unpkg.com/three@0.160.0/...` 在运行时加载，CDN 不可达、被拦截、离线环境或更严格的 CSP 都会导致应用无法启动。
- Files: `index.html:780-792`
- Current mitigation: 版本已固定为 `three@0.160.0`
- Recommendations: 优先把 `three` 及 addons 本地 vendoring 或通过 bundler 打包进仓库产物；如果仍保留外链，至少补充可观测的加载失败提示与降级策略。

**浏览器本地状态缺少统一校验:**
- Risk: `localStorage` 中的 `tinyToonDuel_visualMode`、`tinyToonDuel_bestWinSeconds`、`tinyToonDuel_aiDifficultyByMode` 由多个分散位置读写，异常值可能造成配置漂移或难以复现的启动行为。
- Files: `index.html:1067-1070`, `index.html:1118-1131`, `index.html:1154-1168`, `index.html:2587`
- Current mitigation: 对 `tinyToonDuel_aiDifficultyByMode` 有 `try/catch`，其余键主要依赖默认值回退
- Recommendations: 集中封装 local storage schema，做字段白名单、类型校验和 reset 入口；避免把配置协议散落在 UI 与玩法逻辑之间。

## 性能瓶颈

**启动阶段同步等待全部预加载资产:**
- Problem: `init()` 会在进入菜单前先 `await loadAssets()`，而 `loadAssets()` 使用 `Promise.all()` 等待所有声明的 GLTF 请求完成。
- Files: `index.html:1136-1147`, `index.html:1296-1337`
- Measurement: Not detected
- Cause: 预加载放在首屏主路径，且没有分阶段装载或真正的 loading progress 管理。
- Improvement path: 把关键角色与首屏必需模型前置，装饰物和非当前模式资产延迟加载；为菜单态和 match start 增加分阶段缓存策略。

**命中检测和交互遍历主要依赖线性扫描:**
- Problem: `findCoverHit()`、`findClosestPlayerHit()`、`findClosestMiss()`、`findBarrelHit()` 都对 `world.cover`、`world.entities`、`world.barrels` 直接遍历；主循环还要持续更新多个数组型集合。
- Files: `index.html:2834-2852`, `index.html:5145-5194`
- Measurement: Not detected
- Cause: 当前实现没有空间分区、broadphase 或数据分桶。
- Improvement path: 在实体数和可破坏物继续增长前，引入 grid / spatial hash / quadtree；把高频命中查询从全量遍历改为局部候选集。

## 脆弱区域

**主循环与模式切换链路:**
- Why fragile: `animate()` 依赖固定更新顺序，`state.mode` 会在 `killCam`、`playing`、`menu` 等模式间切换，同时复用同一批 `world`、`fx`、`input` 数据。
- Files: `index.html:2834-2852`, `index.html:2654-2682`, `index.html:4393-4584`
- Common failures: 新增状态后遗漏 reset；round 结束与 match 结束互相覆盖；特效、UI、输入状态在模式切换后残留。
- Safe modification: 先定义显式状态机和进入/退出钩子；为每个 mode 写清楚需要清理的集合、定时器和 DOM 状态；避免在多个函数中隐式切换 mode。
- Test coverage: No automated tests detected

**资产路径解析与视觉回退链路:**
- Why fragile: `loadAssets()` 通过 `fetch('./assets.json')` 读取清单，但 `loadGltf()` 会把相对路径改写为 `../${path}`；同时又存在 `settings.usePlaceholders` 和 `cloneAsset()` 的回退逻辑。
- Files: `index.html:1063-1070`, `index.html:1296-1387`
- Common failures: 子路径部署时 URL 解析出错；manifest 名称变更后模型静默失败；placeholder 模式掩盖真实资产缺失。
- Safe modification: 在改 manifest、目录结构或部署路径之前，先统一 URL 解析策略；对 `failed: true` 的资产增加显式告警；把“可接受的 fallback”和“必须中止启动”的错误区分开。
- Test coverage: No automated tests detected

**HUD/DOM 与玩法逻辑强耦合:**
- Why fragile: 脚本顶部一次性抓取大量 DOM 节点，后续在游戏循环和状态更新里散布 `innerHTML`、`textContent`、`style`、`classList` 变更。
- Files: `index.html:1001-1032`, `index.html:2495-2697`, `index.html:4605-4974`
- Common failures: DOM id 重命名导致运行时异常；UI 重绘遗漏造成显示错误；逻辑改动意外影响 HUD 表现。
- Safe modification: 把 HUD 更新收敛成少数 renderer 函数；减少 gameplay 逻辑里直接操作 DOM；尽量用数据对象驱动视图刷新。
- Test coverage: No automated tests detected

## 扩展上限

**当前实现更适合小规模竞技场:**
- Current capacity: `CONFIG.gameModes` 仅定义了 `duel`（2 players）与 `deathmatch`（4 players）；更大规模容量 Not detected
- Files: `index.html:984-987`
- Limit: 随着玩家数、cover、barrel、pickup 和粒子数量增加，线性命中检测、逐帧数组更新以及 HUD 更新都会迅速变贵。
- Symptoms at limit: 帧率下降、输入滞后、AI 决策不稳定、命中判定与视觉反馈不同步。
- Scaling path: 在扩展模式前先做空间索引、对象池和渲染分层；若继续增长实体规模，再考虑把 UI 与 gameplay 数据更新进一步解耦。

## 风险依赖

**`UNPKG` 上的 `three` 运行时依赖:**
- Risk: 应用启动依赖 `UNPKG` 返回 ESM 模块；任何网络、策略或第三方供应问题都会直接阻断启动。
- Files: `index.html:780-792`
- Impact: `three`、`GLTFLoader`、`SkeletonUtils` 无法导入时，`init()` 之前就会失败，页面只剩静态壳。
- Migration plan: 改为本地依赖或打包产物；若保留 import map，至少预留本地 fallback。

**Google Fonts 外部字体依赖:**
- Risk: `@import url('https://fonts.googleapis.com/...')` 也是运行时外链。
- Files: `index.html:8`
- Impact: 主要影响首屏稳定性和视觉一致性；在受限网络下会回退到系统字体，不一定致命，但会增加不可控差异。
- Migration plan: 自托管字体文件，或接受系统字体并移除外部请求。

## 缺失的关键能力

**自动化验证能力缺失:**
- Problem: 仓库根目录只检测到 `index.html`、`assets.json`、`favicon.ico` 和本地资产目录，未检测到 `package.json`、测试配置或浏览器自动化脚手架。
- Current workaround: 依赖人工打开浏览器做手动游玩验证。
- Blocks: 安全重构、回归检测、持续集成、多人并行修改后的快速验收。
- Implementation complexity: Medium

**资产装载失败缺少显式诊断:**
- Problem: `loadGltf()` 在失败时会返回 `{ failed: true }`，但默认不会阻断流程，也没有统一错误面板或遥测输出。
- Files: `index.html:1356-1375`
- Current workaround: 手动切换到 placeholder 模式或打开浏览器开发者工具排查
- Blocks: 资产重命名、路径调整、部署后 404 的快速定位
- Implementation complexity: Low to Medium

## 测试覆盖缺口

**核心玩法与战斗判定:**
- What's not tested: 射击命中、barrel 爆炸、grenade 物理、cover 受击、AI 行为和模式切换后的 reset
- Risk: 平衡性与正确性回归会在没有预警的情况下进入主分支
- Priority: High
- Difficulty to test: 逻辑与 `THREE`、DOM 和共享全局状态耦合较深，当前需要先提取可纯测的子模块

**启动链路与资产可用性:**
- What's not tested: `assets.json` 加载、GLTF URL 解析、CDN 可达性、placeholder fallback、子路径部署兼容性
- Risk: 页面能打开但模型缺失，或在目标部署环境直接无法启动
- Priority: High
- Difficulty to test: 仓库内未检测到 headless browser smoke test

**HUD 与持久化状态同步:**
- What's not tested: `menu`/`paused`/`matchOver`/`killCam` 切换、leaderboard 可见性、`localStorage` 持久化键的回放一致性
- Risk: UI 软锁、显示错误、状态残留
- Priority: Medium
- Difficulty to test: DOM 更新分散在同一大文件中，依赖实时帧循环和多处副作用

---

*Concerns audit: 2026-03-09*
*Update as issues are fixed or new ones discovered*
