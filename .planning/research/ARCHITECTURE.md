# Architecture Research

**Domain:** 浏览器俯视角竞技射击游戏的枪械命中确认重构
**Researched:** 2026-03-09
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Input / Aim Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Pointer aim  │  Weapon switch  │  Reload intent           │
├─────────────────────────────────────────────────────────────┤
│                 Firearm Resolution Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Weapon config │ Spread calc │ Hit classification │ Damage  │
├─────────────────────────────────────────────────────────────┤
│                 Feedback Presentation Layer                 │
├─────────────────────────────────────────────────────────────┤
│ HUD marker │ Camera pulse │ Tracer / muzzle │ Kill confirm │
├─────────────────────────────────────────────────────────────┤
│                 Shared State / Tuning Layer                 │
│  cooldowns │ feedback timers │ mode-aware intensity         │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `firearm resolver` | 只负责开火判定、命中类型与 shot result 产出 | 从 `attemptFire()` 中抽出纯结果层 |
| `feedback router` | 把 shot result 转换为 HUD、camera、FX、popup 事件 | 独立函数或轻量 dispatcher |
| `weapon feedback tuning` | 为三把枪提供时序、强度、节流参数 | 集中配置表，避免散落常量 |
| `combat state bridge` | 连接 damage/kill 结果与 kill confirm、killcam、near-miss | 明确优先级与冲突规则 |

## Recommended Project Structure

```text
index.html                 # Entry shell + import map
game/
├── combat/
│   ├── firearm-resolver.js   # Shot classification and result building
│   ├── firearm-feedback.js   # Shooter-side confirm routing
│   └── firearm-tuning.js     # Per-weapon feel parameters
├── hud/
│   └── hit-confirm.js        # Crosshair, marker, kill confirm UI
├── fx/
│   └── camera-feedback.js    # Hitstop, shake, pulse, timing guards
└── state/
    └── combat-feedback.js    # Shared timers and throttles
```

### Structure Rationale

- **`combat/`**: 把“这枪打到了什么”和“要播什么反馈”分开，是本里程碑最核心的边界。
- **`hud/`**: 射手侧命中确认天然属于 HUD 层，不应继续散在 damage 与 popup 分支里。
- **`fx/`**: camera pulse、hitstop、tracer timing 需要集中调度，避免不同事件互相覆盖。
- **`state/`**: `deathmatch` 高频命中需要节流和模式特异参数，不能只靠全局零散 timer。

## Architectural Patterns

### Pattern 1: Shot Result Object

**What:** 先得到统一 shot result，再决定如何表现。  
**When to use:** 任何需要区分命中对象与反馈强度的枪械链路。  
**Trade-offs:** 会多一层结构，但换来清晰边界和更好测试性。

**Example:**
```typescript
type ShotResult = {
  weaponId: 'pistol' | 'smg' | 'shotgun';
  outcome: 'player_hit' | 'kill' | 'environment_hit' | 'miss';
  targetTeam: 'p1' | 'p2' | 'p3' | 'p4' | null;
  didDamage: boolean;
  shotStart: Vector3;
  shotEnd: Vector3;
};
```

### Pattern 2: Feedback Routing by Outcome

**What:** 不在判定函数里直接硬编码所有反馈，而是按 outcome 路由。  
**When to use:** 需要 mode-aware、weapon-aware、kill-aware 的反馈层。  
**Trade-offs:** 初期代码量略增，但可以显著减少 if/else 爆炸。

**Example:**
```typescript
function presentShotResult(result) {
  if (result.outcome === 'kill') return presentKillConfirm(result);
  if (result.outcome === 'player_hit') return presentHitConfirm(result);
  if (result.outcome === 'environment_hit') return presentEnvironmentImpact(result);
  return presentMiss(result);
}
```

### Pattern 3: Weapon-Tuned Feedback Tables

**What:** 把 `pistol`、`smg`、`shotgun` 的反馈强度和节奏收敛到一处。  
**When to use:** 同一反馈类型要随武器和模式变化时。  
**Trade-offs:** 需要额外维护参数表，但比散落常量更稳定。

## Data Flow

### Request Flow

```text
[Player input]
    ↓
[Aim direction] → [attempt fire] → [shot resolution] → [shot result]
    ↓                                                  ↓
[Tracer / muzzle] ← [feedback router] ← [outcome mapping]
    ↓
[HUD marker / camera pulse / kill confirm]
```

### State Management

```text
[Feedback tuning]
    ↓
[Shot result]
    ↓
[HUD + camera + FX timers]
    ↓
[Readability guards / throttles]
```

### Key Data Flows

1. **枪械命中流:** 输入开火 → 计算 spread → 分类命中 → 生成 shot result → 派发 shooter feedback。
2. **终结确认流:** damage 导致 `hp <= 0` → 标记 kill → 升级普通命中为 kill confirm → 再决定是否触发 killcam。
3. **高频连射流:** `smg` 连射命中 → 累积轻量确认 → 节流强特效 → 保持追踪与读场稳定。

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 2-4 players | 单项目内的 resolver + feedback router 足够 |
| 4-8 players / 高频 FX | 需要更严格的 transient object pooling 与 feedback throttling |
| 更多武器/伤害源 | 再把 `grenade`、`barrel`、`melee` 接入同一 outcome model |

### Scaling Priorities

1. **First bottleneck:** 高频连射下的 FX 对象与 HUD 更新过多 —— 先做节流和复用。
2. **Second bottleneck:** outcome 与 damage/killcam 竞争状态 —— 先明确优先级，再扩展更多伤害源。

## Anti-Patterns

### Anti-Pattern 1: Resolution and Presentation Mixed Together

**What people do:** 在 `attemptFire()` 内部同时做命中判定、伤害、tracer、屏幕反馈、popup、kill confirm。  
**Why it's wrong:** 任何一个反馈改动都会碰到判定逻辑，回归面很大。  
**Do this instead:** 先生成 shot result，再把反馈按 outcome 路由。

### Anti-Pattern 2: One Feedback Strength for Every Weapon

**What people do:** 所有枪都共享同一 hitstop、same marker、same pulse。  
**Why it's wrong:** 武器身份会被抹平，玩家只能感知 DPS 差异。  
**Do this instead:** 用武器 tuning 表为三把枪分层设计反馈曲线。

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None required | Not applicable | 本里程碑不依赖新增外部服务 |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `attemptFire` ↔ `shot result` | structured object | 判定层不再直接决定所有表现细节 |
| `shot result` ↔ `HUD confirm` | direct function call or small dispatcher | 保证 shooter-side 反馈始终走统一入口 |
| `damage/kill` ↔ `kill confirm` | promoted outcome | kill confirm 必须建立在真实 kill 上 |
| `shot result` ↔ `near-miss / killcam` | priority rules | 防止戏剧性系统吞掉真实命中反馈 |

## Sources

- 当前项目代码与 `.planning/codebase/ARCHITECTURE.md`
- [The Art of Screenshake - GDC Vault](https://www.gdcvault.com/play/1022248/The-Art-of-Screenshake)
- [Juicing Your Cameras With Math - Game Developer](https://www.gamedeveloper.com/design/juicing-your-cameras-with-math)
- [Three.js Sprite docs](https://threejs.org/docs/#api/en/objects/Sprite)

---
*Architecture research for: browser shooter firearm feedback*
*Researched: 2026-03-09*
