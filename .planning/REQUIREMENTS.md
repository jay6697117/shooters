# Requirements: Tiny Toon Duel

**Defined:** 2026-03-09
**Core Value:** `New players should be able to enter Tiny Toon Duel and get a clearly learnable, winnable first match.`

## v1 Requirements

Requirements for the `v1.0 Beginner-Friendly Difficulty Pass` milestone. Each maps to exactly one roadmap phase.

### Difficulty Ladder

- [ ] **DIFF-01**: 玩家可以在菜单中按模式选择 `novice`、`easy`、`normal`、`hard` 四档难度，并持久化各模式的选择
- [ ] **DIFF-02**: 在没有历史存档时，`duel` 默认使用 `novice`，`deathmatch` 默认使用 `easy`

### Match Pressure

- [ ] **MODE-01**: 玩家在低难度 `deathmatch` 中会进入更低局面压力的对局，而不是只面对数值稍降的同规模乱斗

### Balance

- [ ] **BAL-01**: `novice` 与新的 `easy` 必须明显弱于当前版本的 `easy`，同时 `normal` 与 `hard` 继续保持竞技递进关系

### UX

- [ ] **UX-01**: 难度标签与规则提示使用中文，并且会实时反映当前模式和当前难度对应的实际规则

## v2 Requirements

### Gunfeel v1.1 candidate

- **GF-01**: 玩家每次用枪命中角色时都能立即获得明确确认
- **GF-02**: 玩家击杀命中时会收到明显强于普通命中的终结确认
- **GF-03**: `pistol`、`smg`、`shotgun` 各自具备可感知的开火节奏和反馈个性

### Accessibility & Assist

- **AST-01**: 玩家可按偏好启用更强的新手保护，例如瞄准辅助、额外减伤或更宽容错
- **AST-02**: 玩家可按偏好切换反馈强度或可读性档位

## Out of Scope

| Feature | Reason |
|---------|--------|
| 枪械 hit confirm / kill confirm 重做 | 已延期为 `v1.1 candidate`，当前先解新手门槛 |
| 玩家侧辅助瞄准或额外减伤 | 当前里程碑只调 AI 和模式压力，不引入新辅助系统 |
| 新武器、新模式、新地图 | 当前优先让已有玩法更容易上手，而不是扩内容 |
| 新外部音效/美术素材管线 | 本轮默认只使用现有资源与文案改动 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DIFF-01 | Phase 1 | Pending |
| DIFF-02 | Phase 1 | Pending |
| MODE-01 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| BAL-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after v1.0 difficulty takeover*
