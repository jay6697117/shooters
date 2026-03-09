# Tiny Toon Duel

## What This Is

这是一个基于浏览器的俯视角竞技射击游戏，当前提供 `duel` 与 `deathmatch` 两种模式，并围绕本地 Three.js 场景、角色模型、武器切换与战斗反馈构建完整对局流程。项目当前已经可玩，但枪械命中后的确认感不足，因此本轮里程碑聚焦把玩家开枪后的命中闭环做得更直接、更清晰、更有爽感。

## Core Value

`Player-fired gunshots must feel immediate, readable, and unquestionably confirmed on hit.`

## Current Milestone: v1.0 Gunfeel Pass

**Goal:** 让 `pistol`、`smg`、`shotgun` 在 `duel` 与 `deathmatch` 中都具备明确、即时、可读的射手侧命中确认。

**Target features:**
- 构建统一的枪械射击结果模型，解耦命中判定与反馈触发
- 强化玩家命中、击杀、打中场景与打空时的差异化确认
- 为三把枪建立更鲜明的反馈节奏与可调参数结构

## Requirements

### Validated

- ✓ 玩家可以在浏览器中启动并完成一局 `duel` 或 `deathmatch` 对战 — pre-planning codebase
- ✓ 玩家可以使用 `pistol`、`smg`、`shotgun` 进行射击、切枪与换弹 — pre-planning codebase
- ✓ 游戏已经具备基础战斗反馈，包括 `tracer`、`muzzle`、`hitFlash`、`near-miss`、`killcam`、`grenade`、`pickup` — pre-planning codebase

### Active

- [ ] 玩家每次用枪命中角色时都能立即获得明确确认
- [ ] 玩家能清晰区分角色命中、环境命中与完全打空
- [ ] 三把枪在反馈节奏上具备可感知差异，同时不破坏瞄准与读场

### Out of Scope

- 手雷、爆炸桶、近战反馈重做 — 本轮只聚焦枪械射击闭环，避免范围扩散
- 新武器或新模式 — 当前优先修正已有玩法的核心手感
- 新外部音效/美术素材管线 — 本轮默认只使用现有效果和程序化反馈
- 大规模 AI 或战斗系统重写 — 当前问题核心是命中确认，不是整体 combat redesign

## Context

- 当前主应用逻辑集中在 `index.html` 的单个 `<script type="module">` 中，枪械判定与反馈主要收敛在 `attemptFire()`、`applyDamage()`、`spawnTracer()`、`triggerMuzzle()` 等函数。
- 现有实现已经有 `spread`、`tracer`、`muzzle`、`hitstop`、`near-miss drama`、`weapon switch`、`reload`，说明问题不是“完全没有反馈”，而是反馈的层次、同步性和命中确认闭环不足。
- 用户试玩反馈明确指出：“明明打中了，但反馈太弱/不确定，也没有击中之后反馈。” 这说明优先级应放在 shooter-side hit confirm，而不是先扩展弹道、地图或武器种类。
- 本轮里程碑默认先做研究，再形成要求与路线图，后续 phase 规划应继续尊重 `workflow.research = true`。

## Constraints

- **Tech stack**: 保持现有浏览器 + Three.js 架构 — 当前项目没有 bundler、测试框架或后端，里程碑不能假设全新基础设施
- **Scope**: 只覆盖枪械射击闭环 — 避免把 grenade、barrel、melee 一起拖入本轮
- **Experience**: 命中反馈要明显偏爽，但不能遮挡瞄准与读场 — 这是 `duel` 与 `deathmatch` 同时成立的硬约束
- **Assets**: 不新增大规模外部音视频资产依赖 — 优先通过程序化视觉、时序和已有元素增强反馈

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 把本轮定义为 `v1.0 Gunfeel Pass` | 当前尚无 tracked milestone，且问题集中在枪械命中体验 | — Pending |
| 优先修射手侧命中确认 | 用户反馈直接指向“打中了但不确定” | — Pending |
| 采用中等重构而非纯调参 | 现有反馈逻辑已混在 `attemptFire()` 内，后续维护需要更清晰边界 | — Pending |
| 研究先行，之后再做 requirement/roadmap | 需要先验证 gunfeel 常见模式与 pitfalls，避免只凭直觉拆 phase | — Pending |

---
*Last updated: 2026-03-09 after milestone v1.0 initialization*
