# Tiny Toon Duel

## What This Is

这是一个基于浏览器的俯视角竞技射击游戏，当前提供 `duel` 与 `deathmatch` 两种模式，并围绕本地 Three.js 场景、角色模型、武器切换与战斗反馈构建完整对局流程。项目已经可玩，但新手进入首局时仍然容易被 AI 压制，因此当前里程碑改为优先把难度梯度、默认档位与模式压力调到更友好、更容易上手的状态。

## Core Value

`New players should be able to enter Tiny Toon Duel and get a clearly learnable, winnable first match.`

## Current Milestone: v1.0 Beginner-Friendly Difficulty Pass

**Goal:** 让新手玩家在 `duel` 与 `deathmatch` 中都能以更友好的默认档位进入游戏，并通过更平滑的难度梯度逐步理解玩法。

**Target features:**
- 新增 `novice` 并把当前难度梯度扩展为 `novice`、`easy`、`normal`、`hard`
- 把 `duel` 默认档位下调为 `novice`，把 `deathmatch` 默认档位下调为 `easy`
- 让低难度 `deathmatch` 具备更低局面压力，并确保菜单文案与实际规则一致

## Requirements

### Validated

- ✓ 玩家可以在浏览器中启动并完成一局 `duel` 或 `deathmatch` 对战 — pre-planning codebase
- ✓ 玩家可以使用 `pistol`、`smg`、`shotgun` 进行射击、切枪与换弹 — pre-planning codebase
- ✓ 游戏已经具备可切换的 AI 难度菜单与按模式存储的难度配置 — pre-planning codebase

### Active

- [ ] 玩家可以按模式选择 `novice`、`easy`、`normal`、`hard` 四档难度，并记住各模式的选择
- [ ] 首次进入游戏时，`duel` 默认更适合新手，`deathmatch` 默认比当前版本更温和
- [ ] 低难度 `deathmatch` 的实际人数/生命压力与菜单文案保持一致，不再出现“UI 写一套、对局跑一套”

### Out of Scope

- 枪械 hit confirm / gunfeel 重做 — 已下放为 `v1.1 candidate`，不混入当前 active scope
- 玩家侧瞄准辅助、额外减伤或自动纠错 — 当前目标是调低 AI 与模式压力，不做 player-assist 系统
- 新武器、新模式或地图扩展 — 本轮聚焦新手上手门槛，不扩张玩法面
- 新外部音效/美术素材管线 — 本轮只调整配置、规则与现有 UI 文案

## Context

- 当前主应用逻辑集中在 `index.html` 的单个 `<script type="module">` 中，AI 难度、模式选择、开局初始化与 HUD 文案也都集中在这里。
- 现有实现已经有三档难度：`easy`、`normal`、`hard`；默认值分别是 `duel=easy`、`deathmatch=normal`，并通过 `tinyToonDuel_aiDifficultyByMode` 写入本地存储。
- 现有 `deathmatch` 的人数、生命数与菜单规则提示来自静态 `gameModes` 配置，尚未随难度变化，因此“降低局面压力”不能只靠 AI 数值调低，必须引入按难度派生的模式配置入口。
- 当前没有 `MILESTONES.md` 历史，也没有已执行中的 phase，因此本次不是追加一个已归档 milestone，而是直接重写当前 `v1.0` 规划。

## Constraints

- **Tech stack**: 保持现有浏览器 + Three.js 架构 — 当前项目没有 bundler、测试框架或后端，不能假设新增大型基础设施
- **Scope**: 只覆盖难度梯度、默认档位、模式压力与菜单可读性 — 避免把 gunfeel 或 combat redesign 一起拉进本轮
- **Experience**: 新手档必须明显更容易上手，但仍要保留向 `normal` / `hard` 递进的学习曲线
- **Testing**: 当前以浏览器手工验证为主 — 需要优先保证配置、文案与实际对局行为一致

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 由 `Beginner-Friendly Difficulty Pass` 接管当前 `v1.0` | 现有 `v1.0 Gunfeel Pass` 尚未执行，且用户要求“先把游戏难度降低” | — Pending |
| 新增 `novice`，并把默认档位整体下调一档 | 满足“新手玩家友好”的第一进入体验 | — Pending |
| 低难度 `deathmatch` 同时降低 AI 压力与对局压力 | 只调 AI 数值不足以显著降低多 AI 乱斗门槛 | — Pending |
| 跳过 research，直接进入 requirements / roadmap / implementation | 本轮是对既有难度系统的重排，不是陌生领域探索 | — Pending |
| 原 gunfeel 工作延后为 `v1.1 candidate` | 避免当前 milestone 同时承载两条互相竞争的优先级 | — Pending |

---
*Last updated: 2026-03-09 after milestone v1.0 difficulty takeover*
