# Feature Research

**Domain:** 浏览器俯视角竞技射击游戏的命中确认与枪械手感优化
**Researched:** 2026-03-09
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 明确 `player hit` 确认 | 射手在命中后必须立刻知道“这枪算了” | MEDIUM | 至少包含 HUD 命中提示、时序一致的视觉反馈、与 miss 的明确差异 |
| `kill confirm` 强于普通命中 | 击杀是战斗爽点，不应与普通命中混在一起 | MEDIUM | 需要单独的终结确认层，不能只复用普通命中 |
| 区分 `player hit` / `environment hit` / `miss` | 用户会天然比较三种结果的差异 | MEDIUM | 若三者反馈近似，玩家会感觉武器“打棉花” |
| 三把枪具备可感知身份 | 竞技射击里 weapon feel 不应只靠数值表 | MEDIUM | `pistol` 重确认、`smg` 重连击节奏、`shotgun` 重爆发感 |
| 高速连射仍保持可读 | `deathmatch` 中连续命中是常态 | HIGH | 需要节流、分层和强弱反馈组合，避免反馈淹没准星 |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 武器分层反馈曲线 | 让三把枪打起来主观差异很大，而不是“同一模板换 DPS” | MEDIUM | 这是本项目最值得投入的 differentiator |
| 模式敏感的反馈强度 | `duel` 更重精确确认，`deathmatch` 更重可读和节流 | MEDIUM | 同一套反馈参数不一定同时适合两种模式 |
| 命中链路与 killcam / near-miss 协调 | 保留现有戏剧性系统，但不吞掉真正 hit confirm | HIGH | 需要明确事件优先级和冷却关系 |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 把所有命中都做成大幅屏幕震动 | 看起来更“爽” | 很快破坏瞄准、追踪与读场，尤其在 `smg` 和 `deathmatch` 中 | 使用分层强度：普通命中短促、击杀更强、爆发武器更重 |
| 顺手把 grenade / barrel / melee 一起重做 | 感觉“战斗系统统一” | 会让里程碑失焦，验证面和调参面暴涨 | 本轮只做枪械；其他伤害源后续单独扩展 |
| 先追求复杂 projectile / ballistics | 听起来更“真实” | 用户当前痛点不是弹道模型，而是命中确认闭环缺失 | 先把 hitscan 的结果与反馈做扎实，再决定是否需要 projectile |

## Feature Dependencies

```text
Unified shot result
    └──requires──> Hit classification
                       └──requires──> Feedback routing

Weapon-specific tuning
    └──enhances──> Hit confirm clarity

Kill confirm
    └──requires──> Reliable player_hit and kill detection

Over-aggressive screen FX
    ──conflicts──> Readability in deathmatch
```

### Dependency Notes

- **统一 shot result 依赖命中分类：** 如果不先区分玩家命中、环境命中和打空，后续所有反馈都会继续混在一起。
- **武器特异 tuning 增强 hit confirm：** 同一命中框架下，三把枪仍需要不同的强度、持续时间和节奏。
- **kill confirm 依赖可靠的 kill 判定：** 终结反馈必须建立在准确的伤害结果之上，不能只看动画或 popup。
- **过强全屏特效与可读性冲突：** 尤其是 `smg` 连射与 `deathmatch` 乱战，容易让爽感变成噪音。

## MVP Definition

### Launch With (v1)

- [ ] 统一枪械射击结果模型 — 这是后续所有反馈与 phase 规划的基础
- [ ] `player hit` / `environment hit` / `miss` 差异化确认 — 直接回应用户“不知道有没有打中”
- [ ] `kill confirm` 终结反馈 — 放大最关键的爽点
- [ ] `pistol` / `smg` / `shotgun` 的分层反馈 tuning — 让三把枪打起来真的不一样

### Add After Validation (v1.x)

- [ ] 目标侧受击表现增强 — 当 shooter-side 闭环稳定后再加更丰富的 target reaction
- [ ] 程序化 / 本地音频层 — 当视觉确认稳定后再补听觉确认
- [ ] 玩家可切换反馈强度 — 当出现明显偏好分歧时再开放

### Future Consideration (v2+)

- [ ] grenade / barrel / melee 反馈统一化 — 等枪械链路成熟后再扩张战斗表面
- [ ] projectile / penetration / advanced ballistics — 只有当核心命中确认已经被验证足够扎实时再考虑

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 统一 shot result + hit 分类 | HIGH | MEDIUM | P1 |
| 明确 `player hit` HUD confirm | HIGH | MEDIUM | P1 |
| `kill confirm` 终结反馈 | HIGH | MEDIUM | P1 |
| 三把枪的节奏化反馈 tuning | HIGH | MEDIUM | P1 |
| 目标侧更丰富受击动画 | MEDIUM | HIGH | P2 |
| 完整音频层 | MEDIUM | MEDIUM | P2 |
| grenade / melee 统一反馈 | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| 普通命中确认 | `DOOM Eternal` 倾向短促但明确的 hit confirm | `ULTRAKILL` 倾向更激进、更快节奏的确认与连锁爽点 | 采用偏街机但仍保读场的强命中确认 |
| 武器身份 | 现代 arena shooters 常通过反馈曲线而非纯伤害数值建立武器性格 | 俯视角 shooters 常通过 muzzle、spread、impact 差异强化身份 | 让 `pistol`、`smg`、`shotgun` 各自有独立确认曲线 |
| 乱战可读性 | 高频命中通常需要节流与分层 | 过量 FX 会快速破坏追踪与目标辨识 | 在 `deathmatch` 中对持续确认做节流和优先级控制 |

## Sources

- [The Art of Screenshake - GDC Vault](https://www.gdcvault.com/play/1022248/The-Art-of-Screenshake)
- [Juicing Your Cameras With Math - Game Developer](https://www.gamedeveloper.com/design/juicing-your-cameras-with-math)
- 当前项目代码与 `.planning/codebase/CONCERNS.md`

---
*Feature research for: browser shooter hit confirm*
*Researched: 2026-03-09*
