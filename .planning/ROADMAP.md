# Roadmap: Tiny Toon Duel

## Current Milestone: v1.0 Beginner-Friendly Difficulty Pass

**Milestone Goal:** 让新手玩家进入 `duel` 与 `deathmatch` 时拥有更友好的默认难度、更平滑的四档梯度与实际规则一致的模式提示，并在最终平衡前插入一轮射击反馈优化。

## Overview

这次 `v1.0 Beginner-Friendly Difficulty Pass` 仍以“第一次进入游戏是否容易上手”为主线，但执行顺序调整为 `difficulty foundation → mode rules → inserted feedback pass → final balance`：先把四档难度、默认值和持久化逻辑建立好，再把 `deathmatch` 低难度的实际压力与菜单规则绑定起来；随后插入一轮聚焦射击反馈与 gunfeel 的 scoped pass，提升开火、命中与击杀的可感知性；最后再做整体平衡收敛，确保 `novice → easy → normal → hard` 的难度梯度与战斗手感一起稳定下来。这样能在现有单文件 Three.js 架构下保持改动可控，同时把试玩中最明显的两类体验问题纳入同一 milestone，而不扩展为全面 combat redesign。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone spine
- Decimal phases (2.1, 2.2): Urgent insertions between integer phases

- [x] **Phase 1: Difficulty Ladder & Persistence** - 增加 `novice`、下调默认档位，并让四档难度按模式稳定持久化 (completed 2026-03-09)
- [ ] **Phase 2: Difficulty-Aware Match Rules** - 让低难度 `deathmatch` 的人数/生命压力与菜单规则文案从同一配置派生
- [ ] **Phase 2.1: Shooting Feedback & Gunfeel Pass (INSERTED)** - 在规则体验稳定后插入射击反馈优化，为最终平衡提供更可靠的手感基线
- [ ] **Phase 3: Balance Pass** - 完成 `novice` 与新 `easy` 的强度下调，并验证四档梯度单调递进

## Phase Details

### Phase 1: Difficulty Ladder & Persistence
**Goal:** 建立四档难度体系与更友好的默认进入体验
**Depends on:** Nothing (first phase)
**Requirements**: [DIFF-01, DIFF-02]
**Success Criteria** (what must be TRUE):
  1. 玩家在菜单中能看到并选择 `novice`、`easy`、`normal`、`hard` 四档，且不会出现非法档位写入
  2. `duel` 首次进入默认落在 `novice`，`deathmatch` 首次进入默认落在 `easy`
  3. 旧版本已有的 `easy` / `normal` / `hard` 本地存档仍可加载，不需要手动清理
**Plans:** 2/2 plans complete

Plans:
- [x] `01-01` Canonical difficulty metadata, defaults, and storage normalization
- [x] `01-02` Menu labels, button order, and per-mode memory

### Phase 2: Difficulty-Aware Match Rules
**Goal:** 让低难度 `deathmatch` 的实际规则与 UI 提示同步收敛
**Depends on:** Phase 1
**Requirements**: [MODE-01, UX-01]
**Success Criteria** (what must be TRUE):
  1. 低难度 `deathmatch` 不再只是原样 4 人乱斗配上更弱 AI，而是真正降低了对局压力
  2. 菜单中的规则说明与开局后的实际人数、生命数保持一致
  3. 模式切换、难度切换、重新开局后都不会出现旧规则残留或 HUD 错位
**Plans:** TBD

Plans:
- [ ] TBD (run `$gsd-plan-phase 2` to break down)

### Phase 2.1: Shooting Feedback & Gunfeel Pass (INSERTED)

**Goal:** 在不做全面战斗系统重写的前提下，提升开火、命中与击杀反馈的即时性、层次感与武器辨识度，为最终平衡提供稳定的战斗体感基线
**Requirements**: [GF-01, GF-02, GF-03]
**Depends on:** Phase 2
**Success Criteria** (what must be TRUE):
  1. 玩家普通命中与击杀命中都能立即获得明确区分的反馈，不再依赖自行猜测是否打中
  2. `pistol`、`smg`、`shotgun` 的开火节奏与反馈强度能被清楚感知，但不会因为过量 FX 破坏读场
  3. `duel` 与 `deathmatch` 下的高频交火不会出现反馈堆叠失控、HUD 噪音过大或 near-miss / killcam 抢占主反馈
**Plans:** TBD

Plans:
- [ ] TBD (run `$gsd-plan-phase 2.1` to break down)

### Phase 3: Balance Pass
**Goal:** 在插入的射击反馈优化之后，收敛四档难度的实际强度关系，保证新手档明显更温和、竞技档仍可用
**Depends on:** Phase 2.1
**Requirements**: [BAL-01]
**Success Criteria** (what must be TRUE):
  1. `novice` 明显弱于新的 `easy`，新的 `easy` 明显弱于当前版本的 `easy`
  2. `normal` 与 `hard` 继续保持面向熟练玩家的递进关系，不被误降到新手档区间
  3. 两种模式下的默认档位都能让首局体验更友好，且不会因插入的 feedback pass 破坏后续进阶空间
**Plans:** TBD

Plans:
- [ ] TBD (run `$gsd-plan-phase 3` to break down)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Difficulty Ladder & Persistence | 2/2 | Complete    | 2026-03-09 |
| 2. Difficulty-Aware Match Rules | 0/0 | Not started | - |
| 2.1 Shooting Feedback & Gunfeel Pass (INSERTED) | 0/0 | Not started | - |
| 3. Balance Pass | 0/0 | Not started | - |
