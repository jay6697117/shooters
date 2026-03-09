# Requirements: Tiny Toon Duel

**Defined:** 2026-03-09
**Core Value:** `Player-fired gunshots must feel immediate, readable, and unquestionably confirmed on hit.`

## v1 Requirements

Requirements for the `v1.0 Gunfeel Pass` milestone. Each maps to exactly one roadmap phase.

### HIT

- [ ] **HIT-01**: 玩家每次用枪命中角色时都能立即获得明确确认
- [ ] **HIT-02**: 玩家击杀命中时会收到明显强于普通命中的终结确认
- [ ] **HIT-03**: 玩家能清晰区分打中角色、打中场景/掩体、以及完全打空

### FEEL

- [ ] **FEEL-01**: `pistol`、`smg`、`shotgun` 各自具备可感知的开火节奏和反馈个性
- [ ] **FEEL-02**: 命中反馈与开火节奏、`tracer`、`muzzle`、屏幕反馈保持同步，不出现迟到或错位确认

### READ

- [ ] **READ-01**: 在 `duel` 中命中确认足够明确，玩家不需要猜测是否打中
- [ ] **READ-02**: 在 `deathmatch` 中命中确认仍保持可读，不因特效过强而影响追踪目标

## v2 Requirements

### Combat Surface Expansion

- **SURF-01**: grenade、barrel、melee 的命中反馈接入统一战斗反馈模型
- **SURF-02**: 目标侧受击反应扩展为更完整的 hit reaction 系统

### Audio & Presentation

- **AUDP-01**: 枪械命中、击杀与环境碰撞具备稳定的音频确认层
- **AUDP-02**: 玩家可按偏好切换反馈强度或可读性档位

## Out of Scope

| Feature | Reason |
|---------|--------|
| 手雷、爆炸桶、近战反馈重做 | 本轮只聚焦枪械射击闭环，避免把战斗表面一起拉宽 |
| 新武器或新模式 | 当前优先修正已有玩法的核心手感，而不是扩展内容 |
| 新外部音效/美术素材管线 | 本轮默认只使用现有效果与程序化反馈 |
| 大规模 AI 或战斗系统重写 | 用户反馈的核心问题是 hit confirm，不是整套 combat system 失效 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HIT-01 | - | Pending roadmap |
| HIT-02 | - | Pending roadmap |
| HIT-03 | - | Pending roadmap |
| FEEL-01 | - | Pending roadmap |
| FEEL-02 | - | Pending roadmap |
| READ-01 | - | Pending roadmap |
| READ-02 | - | Pending roadmap |

**Coverage:**
- v1 requirements: 7 total
- Mapped to phases: 0
- Unmapped: 7 ⚠️

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after milestone v1.0 definition*
