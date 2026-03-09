# Roadmap: Tiny Toon Duel

## Current Milestone: v1.0 Gunfeel Pass

**Milestone Goal:** 让枪械命中结果可靠、命中确认明确、三把枪的反馈节奏可感知且在 `duel` / `deathmatch` 中都可读。

## Overview

这次 `v1.0 Gunfeel Pass` 不是做整套战斗系统翻新，而是围绕枪械射击闭环分三步推进：先把 shot result 和反馈挂点建立起来，再把玩家真正需要的 hit confirm / kill confirm 做清楚，最后收敛三把枪的身份与双模式可读性。这样既能在现有代码结构里完成中等重构，也能让后续 `$gsd-plan-phase` 有清晰的 phase 边界。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions if needed later

- [ ] **Phase 1: Gunfire Outcome Model** - 把枪械判定结果从反馈副作用中拆出来，建立可靠的命中分类与反馈挂点
- [ ] **Phase 2: Shooter-Side Hit Confirm** - 在统一结果模型上实现明确的命中、击杀、环境命中与打空确认
- [ ] **Phase 3: Weapon Identity & Readability Tuning** - 让三把枪打起来主观差异明显，并完成 `duel` / `deathmatch` 双模式可读性收敛

## Phase Details

### Phase 1: Gunfire Outcome Model
**Goal:** 建立统一的枪械 shot result 与命中分类边界，让后续反馈都建立在可信结果上
**Depends on:** Nothing (first phase)
**Requirements**: [HIT-03, FEEL-02]
**Success Criteria** (what must be TRUE):
  1. 玩家能从系统层面稳定区分角色命中、环境命中与打空，不再由多个分支各自“猜测”命中结果
  2. 枪械开火后的 `tracer`、`muzzle`、命中结果时序保持同步，不再出现迟到或错位反馈
  3. `near-miss`、`killcam` 等已有戏剧性系统不会误吞真实命中结果
**Plans:** TBD

Plans:
- [ ] TBD (run `$gsd-plan-phase 1` to break down)

### Phase 2: Shooter-Side Hit Confirm
**Goal:** 在统一结果模型上交付强而清晰的射手侧命中确认与终结确认
**Depends on:** Phase 1
**Requirements**: [HIT-01, HIT-02]
**Success Criteria** (what must be TRUE):
  1. 玩家每次用枪命中角色时都能立刻获得明确确认，不需要主观猜测
  2. 击杀命中的反馈明显强于普通命中，并且不会与普通命中混淆
  3. 环境命中和完全打空不会伪装成角色命中
  4. reload、weapon switch、killcam 等状态切换不会伪造或吞掉 hit confirm
**Plans:** TBD

Plans:
- [ ] TBD (run `$gsd-plan-phase 2` to break down)

### Phase 3: Weapon Identity & Readability Tuning
**Goal:** 拉开三把枪的反馈曲线，并验证 `duel` 与 `deathmatch` 中的可读性与爽感平衡
**Depends on:** Phase 2
**Requirements**: [FEEL-01, READ-01, READ-02]
**Success Criteria** (what must be TRUE):
  1. `pistol`、`smg`、`shotgun` 在开火节奏和命中反馈上具备可被玩家描述出的差异
  2. 在 `duel` 中，玩家不再需要猜测是否命中
  3. 在 `deathmatch` 中，高频命中反馈仍然可读，不会淹没准星和目标
  4. 强反馈不会显著破坏追踪、瞄准和 HUD 读取
**Plans:** TBD

Plans:
- [ ] TBD (run `$gsd-plan-phase 3` to break down)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Gunfire Outcome Model | 0/0 | Not started | - |
| 2. Shooter-Side Hit Confirm | 0/0 | Not started | - |
| 3. Weapon Identity & Readability Tuning | 0/0 | Not started | - |
