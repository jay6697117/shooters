# Pitfalls Research

**Domain:** 浏览器俯视角竞技射击游戏的枪械命中反馈优化
**Researched:** 2026-03-09
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: 反馈更强了，但命中仍不可信

**What goes wrong:**
玩家看到了更多特效，却还是不能确信“这枪算不算打中”；结果只是把视觉噪音做大。

**Why it happens:**
开发者先堆 hit marker、shake、flash，没有先统一 `player_hit / environment_hit / miss / kill` 的结果模型。

**How to avoid:**
先建立统一 shot result，再让所有反馈只消费这个结果；禁止各处分支私自判定“像是命中了”。

**Warning signs:**
- 普通命中和打中掩体的反馈相似
- kill confirm 与普通命中偶尔重复或缺失
- `deathmatch` 中玩家仍在怀疑自己是否命中

**Phase to address:**
Phase 1

---

### Pitfall 2: 过度爽感破坏瞄准与读场

**What goes wrong:**
命中时停顿、屏幕脉冲、准星动画、粒子全都很强，短时间看着很爽，但连续战斗中玩家开始丢目标。

**Why it happens:**
设计只优化单次截图效果，没有考虑 `smg` 连射、多人混战和 `deathmatch` 的高频事件密度。

**How to avoid:**
区分普通命中、连续命中、击杀命中的强度级别；对高频反馈做节流；把最强确认保留给 kill。

**Warning signs:**
- `smg` 连射时准星或 HUD 抖得看不清
- 画面中心信息被重复命中标记挡住
- 玩家在 `deathmatch` 中比现在更难追踪目标

**Phase to address:**
Phase 2 / Phase 3

---

### Pitfall 3: 三把枪只有数值差异，没有性格差异

**What goes wrong:**
`pistol`、`smg`、`shotgun` 虽然伤害/射速不同，但玩家主观感受几乎一样，只是快一点或慢一点。

**Why it happens:**
反馈层沿用一套模板，没有把 weapon identity 体现在命中确认节奏、kill confirm 强度和开火后回弹上。

**How to avoid:**
为三把枪分别定义命中、击杀、miss、camera pulse 和 tracer linger 的 tuning。

**Warning signs:**
- 玩家说“换枪只是 DPS 变化”
- `shotgun` 命中没有明显爆发感
- `pistol` 和 `smg` 的命中确认几乎一样

**Phase to address:**
Phase 3

---

### Pitfall 4: 旧戏剧系统吞掉新 hit confirm

**What goes wrong:**
`near-miss drama`、`killcam`、现有 `hitstop` 或 popup 抢占了时序，导致真实命中确认被覆盖、延迟或伪造。

**Why it happens:**
当前战斗反馈已经存在多条链路，但没有统一事件优先级。

**How to avoid:**
定义反馈优先级：`kill confirm > player_hit > environment_hit > miss`，并明确 near-miss 只能在 miss 上触发。

**Warning signs:**
- 命中后同时触发 `CLOSE!`
- 击杀一枪没有普通命中更明确
- killcam 开始前后反馈不一致

**Phase to address:**
Phase 2

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| 在 `attemptFire()` 里继续加更多 if/else | 改动最快 | 后续每次调反馈都碰判定逻辑 | 只在极小热修中可接受 |
| 把所有反馈强度写成散落常量 | 改几个数字很方便 | 武器差异与模式差异难以系统化维护 | 仅原型期可接受 |
| 只靠 popup 文本告诉玩家命中 | 实现简单 | 在高速战斗中可读性差，且无法形成稳定肌肉记忆 | 不建议 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `killcam` | 把 killcam 当作 kill confirm 本身 | 先给 kill confirm，再决定是否进入 killcam |
| `near-miss drama` | miss 与 hit 共用同一触发时机 | near-miss 只能消费真实 `miss` outcome |
| HUD / world FX | 同时在 DOM 和 3D 世界里堆叠强反馈 | 指定主确认层，其他层只做辅助 |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `smg` 连射生成过多瞬态对象 | 掉帧、HUD 卡顿、粒子残留 | 复用 sprite / popup，给高频反馈节流 | 高频命中或多人混战 |
| `shotgun` 每 pellet 都生成完整强反馈 | 屏幕爆炸、读场下降 | 只对主命中给强反馈，其余 pellet 用轻量补充 | 近距离多目标/掩体场景 |
| DOM 文本与 3D FX 同步不稳 | 标记晚到、持续时间怪异 | 用统一 timer/tuning 驱动 HUD 与世界层 | 命中频率升高时 |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| 为了临时加音效引入未锁版本的第三方 CDN 资源 | 运行时不稳定、供应链风险增加 | 若未来扩音频，优先本地化或固定版本 |
| 把反馈强度配置随意写进 `localStorage` 且不校验 | 异常值导致体验不可复现 | 未来如开放配置，做白名单和默认值回退 |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 命中反馈只在目标身上，不在射手侧 | 玩家仍不确定自己是否命中 | 优先补强 crosshair / HUD / camera 层确认 |
| `kill confirm` 与普通命中差不多 | 击杀缺少终结感 | 为 kill 单独设计更强一级的反馈 |
| 所有反馈都在中心准星附近爆开 | 目标和准星被挡住 | 让核心确认短促，辅助反馈分散到世界层或边缘层 |

## "Looks Done But Isn't" Checklist

- [ ] **Hit confirm:** 经常缺少 `environment_hit` 与 `miss` 的明确差异 —— 验证三种结果是否一眼能分辨
- [ ] **Kill confirm:** 经常只是在普通命中上加一点点力度 —— 验证击杀是否真的更强、更明确
- [ ] **Weapon identity:** 经常只改了伤害/射速表 —— 验证三把枪主观手感是否能被玩家描述出来
- [ ] **Deathmatch readability:** 经常 duel 好了但混战崩掉 —— 验证 `deathmatch` 高频事件下是否仍可读

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| outcome 不可信 | HIGH | 回退到统一 shot result 入口，禁止分散反馈判定 |
| 反馈过强影响读场 | MEDIUM | 下调高频强度、增加节流、保留 kill 为最强事件 |
| 武器身份仍不明显 | MEDIUM | 重新拉开每把枪的命中/击杀反馈曲线 |
| near-miss / killcam 冲突 | MEDIUM | 重写反馈优先级并补充手动回归清单 |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 反馈不可信 | Phase 1 | 检查 shot result 是否能稳定区分四类结果 |
| 过度爽感破坏可读性 | Phase 2 / 3 | 在 `smg` 连射与 `deathmatch` 中验证追踪是否仍稳定 |
| 武器无身份 | Phase 3 | 让玩家能口头描述三把枪的差异 |
| 戏剧系统吞掉 hit confirm | Phase 2 | 回归 near-miss、killcam、reload、weapon switch 场景 |

## Sources

- [The Art of Screenshake - GDC Vault](https://www.gdcvault.com/play/1022248/The-Art-of-Screenshake)
- [Juicing Your Cameras With Math - Game Developer](https://www.gamedeveloper.com/design/juicing-your-cameras-with-math)
- 当前项目代码与 `.planning/codebase/CONCERNS.md`

---
*Pitfalls research for: browser shooter gunfeel pass*
*Researched: 2026-03-09*
