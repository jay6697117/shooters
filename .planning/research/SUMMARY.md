# Project Research Summary

**Project:** Tiny Toon Duel
**Domain:** 浏览器俯视角竞技射击游戏的枪械命中确认优化
**Researched:** 2026-03-09
**Confidence:** MEDIUM

## Executive Summary

研究结果非常一致：这类问题的首要任务不是继续堆玩法，而是先把“命中结果”和“反馈表现”拆开。当前项目已经有 `tracer`、`muzzle`、`hitstop`、`near-miss`、`killcam` 等基础元素，因此本轮最优路线不是迁移技术栈，而是在现有 `three@0.160.0` + 浏览器运行时之上，建立统一的枪械 shot result，并让 HUD、camera、world FX 都围绕这个结果工作。

从行业经验看，射击爽感最常见的失败不是“反馈不够多”，而是“反馈不够可信”或“反馈太吵”。这与用户试玩反馈完全对齐：当前问题是打中了但不能确定，而不是特效完全缺席。因此路线图必须先解决 outcome clarity，再解决 per-weapon feel，最后再做模式级可读性收敛。

结论是：本里程碑应保持技术增量最小、结构增量明确。Phase 1 先重构 shot result 和 feedback hook；Phase 2 再补 shooter-side hit confirm 和 kill confirm；Phase 3 最后做三把枪的个性化 tuning 与 `duel` / `deathmatch` 双模式验收。

## Key Findings

### Recommended Stack

本轮里程碑不需要引入新的核心框架。`three@0.160.0` 已经提供了实现 sprite-based hit markers、camera pulse、impact flare、future positional audio 的必要能力；当前浏览器运行时也已具备输入、计时、轻量本地状态和 HUD 容器。

**Core technologies:**
- `three@0.160.0`: 负责场景、sprite、动画、材质和世界层反馈
- Browser Web APIs: 负责输入、动画帧、轻量状态与时序控制
- HTML/CSS HUD: 负责 crosshair、命中标记、击杀确认等射手侧反馈

### Expected Features

本轮 table stakes 很明确：可靠的 `player hit` 确认、强于普通命中的 `kill confirm`、`player/environment/miss` 三者的差异化，以及三把枪的主观身份。最值得投入的 differentiator 不是新玩法，而是武器反馈曲线和双模式可读性的平衡。

**Must have (table stakes):**
- 统一 shot result 与命中分类
- 明确的 `player hit` / `environment hit` / `miss` 差异
- 独立的 `kill confirm`
- 三把枪的分层反馈 tuning

**Should have (competitive):**
- 模式敏感的反馈强度
- 与 `near-miss` / `killcam` 协调的优先级系统

**Defer (v2+):**
- grenade / barrel / melee 的反馈统一化
- 完整音频层或复杂 projectile 模型

### Architecture Approach

推荐架构是“判定层”和“表现层”明确分离。开火后先生成统一 shot result，再由 feedback router 选择 HUD、camera、tracer、kill confirm、environment impact 的组合。这样既能保留现有 Three.js 和 HUD 资产，又能把 `attemptFire()` 从巨型副作用入口逐步变成更稳定的战斗边界。

**Major components:**
1. `firearm resolver` — 负责 spread、命中分类和结果建模
2. `feedback router` — 负责把结果映射到 HUD / camera / FX
3. `weapon feedback tuning` — 负责三把枪与两种模式的反馈曲线

### Critical Pitfalls

1. **结果不可信** — 先统一 shot result，再增强表现
2. **爽感过强伤害可读性** — 高频反馈必须节流，kill 才是最强事件
3. **三把枪没有性格** — 不要只改数值，要拉开反馈曲线
4. **现有戏剧系统吞掉命中确认** — near-miss 和 killcam 必须服从命中结果优先级

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Gunfire Outcome Model
**Rationale:** 不先统一结果模型，后续所有命中反馈都会继续耦合在 `attemptFire()` 里。  
**Delivers:** 统一 shot result、明确命中分类、反馈挂点。  
**Addresses:** `HIT-01`, `HIT-03` 的结构基础。  
**Avoids:** “反馈更强了，但仍不可信”。

### Phase 2: Shooter-Side Hit Confirm
**Rationale:** 用户当前最大痛点就是打中不确定，必须优先修复。  
**Delivers:** 普通命中确认、环境命中/打空差异、kill confirm、优先级规则。  
**Uses:** 现有 `three`、HUD、camera FX 能力。  
**Implements:** feedback router 与 outcome-specific presentation。

### Phase 3: Weapon Identity Tuning
**Rationale:** 当命中闭环成立后，才能稳定拉开三把枪的节奏与双模式可读性。  
**Delivers:** `pistol` / `smg` / `shotgun` 的分层反馈曲线、模式验收与手动检查清单。  
**Avoids:** “三把枪只有 DPS 差异”与“deathmatch 中爽感变噪音”。

### Phase Ordering Rationale

- 先建结果模型，再做表现层，最后再调武器个性，这是最稳的依赖顺序。
- 先解决可信度，再解决爽感上限，能避免“越做越吵”的常见失败模式。
- 先做枪械，再延后 grenade / melee / audio，可以保持里程碑范围与验收面可控。

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** 需要细化命中确认层级、节流策略和 killcam / near-miss 优先级。
- **Phase 3:** 需要更具体的 per-weapon tuning 与双模式平衡准则。

Phases with standard patterns (skip research-phase):
- **Phase 1:** 属于相对标准的结构重构和结果建模，可直接规划。

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 主要基于当前代码和 Three.js 官方文档 |
| Features | MEDIUM | 依赖行业经验资料与用户试玩反馈 |
| Architecture | MEDIUM | 方向清晰，但具体拆分仍要受现有单文件实现约束 |
| Pitfalls | MEDIUM | 与该类 shooter 项目高度相关，但需在实际调试中再验证强度阈值 |

**Overall confidence:** MEDIUM

### Gaps to Address

- `kill confirm` 与现有 `killcam` 的最终优先级细节仍需在 phase planning 里落成。
- `smg` 高频命中时的节流阈值仍需结合现有帧循环与 HUD 刷新成本确定。
- 若后续想补音效，需要在未来 phase 中单独决定是否引入本地音频文件或纯程序化方案。

## Sources

### Primary (HIGH confidence)
- `/mrdoob/three.js` — `Sprite`, `SpriteMaterial`, `PositionalAudio`, `AudioListener`
- [Three.js Sprite docs](https://threejs.org/docs/#api/en/objects/Sprite) — sprite-facing camera behavior
- [Three.js PositionalAudio docs](https://threejs.org/docs/#api/en/audio/PositionalAudio) — future audio extension path

### Secondary (MEDIUM confidence)
- [The Art of Screenshake - GDC Vault](https://www.gdcvault.com/play/1022248/The-Art-of-Screenshake) — hit feel layering and impact emphasis
- [Juicing Your Cameras With Math - Game Developer](https://www.gamedeveloper.com/design/juicing-your-cameras-with-math) — camera feedback tuning principles

### Tertiary (LOW confidence)
- 当前行业 shooter 经验归纳与现有代码静态分析 — 用于 roadmap grouping，需在 phase planning 中继续校正

---
*Research completed: 2026-03-09*
*Ready for roadmap: yes*
