# Phase 1: Difficulty Ladder & Persistence - Research

**Researched:** 2026-03-09
**Domain:** Browser-based difficulty configuration in a single-file Three.js game
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 保持当前轻量表达：继续使用“模式副标题 + 一行规则”的结构。
- 不为每个难度再增加单独的解释面板、帮助区或说明卡片。
- 推荐默认值只通过当前预选状态和现有文案传达。
- 不额外增加“推荐”“首次游玩建议”之类的徽标或强提示。
- 旧存档或非法存档在回到有效档位时采用静默回退。
- 不弹提示，不额外增加菜单内提示条，优先保持菜单干净。
- 各模式难度长期保存在浏览器本地，直到玩家主动修改。
- 不做“仅本次会话生效”或“每次打开恢复推荐默认值”的策略。

### Claude's Discretion
- 当前轻量文案下的具体措辞可以微调，但不能改变“轻量、无额外帮助块”的方向。
- 非法存档的具体归一化顺序和内部容错实现由 Claude 自行决定，只要用户看到的是静默回退。

### Deferred Ideas (OUT OF SCOPE)
- 为当前默认档位增加“推荐”徽标或“首次游玩建议”提示
- 为每个难度增加更详细的说明文本或帮助区
- 对非法存档回退增加用户可见提示

</user_constraints>

<research_summary>
## Summary

Phase 1 的最佳做法不是继续扩 UI，而是把“难度顺序、标签、默认值、合法值归一化、按模式记忆”收束到一个单一配置入口，然后让菜单事件、初始化读取和开局前同步都复用同一条读写链路。当前 `index.html` 已经体现出这种方向：`CONFIG.difficulty.order / labels / byMode` 提供声明式入口，`normalizeDifficultyMap()`、`getDifficultyForMode()`、`setDifficultyForMode()`、`updateDifficultyUI()` 负责读取、写入与显示。

对 planner 来说，Phase 1 不应该再被拆成“视觉说明”“推荐提示”“帮助区”等多个产品子方向；这些都已经在 discuss-phase 被锁定为不做。真正需要计划的，是如何把已有行为整理成一个可验证的最小执行单元：确认四档按钮和默认值稳定存在、确认旧存档兼容且非法值静默回退、确认模式切换与开局使用的是同一份已归一化难度状态。

**Primary recommendation:** 将 Phase 1 规划为一个单一、聚焦 `index.html` 的执行计划，内部拆成 2-3 个任务：难度配置与默认值、持久化/归一化链路、浏览器验证矩阵。
</research_summary>

<standard_stack>
## Standard Stack

本 phase 不引入新依赖，沿用当前仓库已经建立的运行时栈：

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | `0.160.0` | 游戏主场景与运行时 | 当前项目既有基础设施，Phase 1 不需要替换 |
| Browser DOM APIs | built-in | 菜单按钮、标签文案、事件绑定 | 当前菜单逻辑已经完全建立在 DOM 读写之上 |
| `localStorage` | built-in | 记住各模式难度偏好 | 当前已有最佳时间和视觉模式等持久化模式可复用 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | 不新增 supporting dependency | 当前 phase 是配置与 UI 收敛，不值得加库 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 继续在 `index.html` 内集中维护 | 拆出独立 `difficulty.js` 模块 | 长期更清晰，但对当前 phase 来说超出范围，且会扩大 review 面 |
| 直接使用 `localStorage` | 引入状态管理层 | 对单文件浏览器游戏过重，收益不足 |

**Installation:**
```bash
# No new packages for Phase 1
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Single Source of Truth for difficulty state
**What:** 把难度顺序、显示标签、默认值和合法值判断集中在 `CONFIG.difficulty` 与 `getDifficultyForMode()` / `normalizeDifficultyMap()` 这组函数中。  
**When to use:** 任何菜单展示、存档读取、开局同步都应经过这条链路，而不是各自硬编码默认值。  
**Why it matters for planning:** 这决定了计划应优先围绕“统一读写入口”设计任务，而不是拆成多个互不感知的 UI patch。

### Pattern 2: Mode-scoped persistence with silent recovery
**What:** 每个模式单独存储难度偏好；读取时静默修正非法值；不对玩家打断式提示。  
**When to use:** 项目已有 `localStorage` 使用习惯，且 discuss-phase 已明确要求菜单保持干净。  
**Why it matters for planning:** 需要单独有一个任务覆盖“旧存档兼容 + 非法值回退 + 不引入用户提示”。

### Pattern 3: Menu/UI sync before match start
**What:** `setGameMode()`、`updateMenuModeCopy()`、`updateDifficultyUI()`、`startMatch()` 需要共享同一份当前难度状态。  
**When to use:** 玩家切换模式、切换难度、重新开局时。  
**Why it matters for planning:** 需要把“菜单状态”和“开局实际状态”的一致性列为显式验证点，而不是默认它自然成立。

### Anti-Patterns to Avoid
- **分散默认值:** 在按钮、初始化和开局逻辑里各自写 `novice/easy`，后续极易漂移。
- **为轻量 phase 过度拆模块:** 当前项目仍是单文件主逻辑；为了这次 phase 做结构性拆分，review 成本会大于收益。
- **把非法存档处理做成用户提示流:** 这与已锁定的轻量菜单方向冲突，也会把 Phase 1 变成 UX 引导问题。
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 难度状态同步 | 额外事件总线或发布订阅层 | 继续复用当前 `CONFIG + getter/setter + UI update` 链路 | 现在只有两个模式和一个菜单入口，事件总线只会增加复杂度 |
| 偏好存储抽象 | 通用持久化框架 | 原生 `localStorage` + 归一化函数 | 当前只有少量键值存储，原生 API 足够且已存在 |
| Phase 1 测试基建 | 全量引入自动化测试框架 | 轻量静态 smoke + 手工浏览器矩阵 | 当前 phase 是单文件 UI/配置调整，先把验证边界写清楚比加框架更值当 |

**Key insight:** 这个 phase 最大风险不是“技术能力不够”，而是把本来简单的默认值/持久化问题做复杂了。
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: UI 状态和运行时状态漂移
**What goes wrong:** 菜单上选中了一个难度，但开局使用的还是旧值。  
**Why it happens:** 菜单更新只改 DOM，开局逻辑读的却是另一份状态。  
**How to avoid:** 计划中必须包含“开局前重新应用当前模式难度”的任务和验证。  
**Warning signs:** 切难度后不切模式直接开局，实际对局不匹配菜单文案。

### Pitfall 2: 旧存档兼容只覆盖 happy path
**What goes wrong:** 只验证旧的 `easy/normal/hard`，但没有验证缺字段、非法值、空对象等情况。  
**Why it happens:** 默认把 `JSON.parse()` 成功等同于数据有效。  
**How to avoid:** 计划中显式要求归一化函数做 value-level 校验，而不只是 shape-level 读取。  
**Warning signs:** 菜单初始不高亮、开局 fallback 到错误难度、控制台出现 undefined-driven 分支。

### Pitfall 3: Phase 1 和 Phase 2 边界混淆
**What goes wrong:** 在 Phase 1 顺手加入过多 `deathmatch` 低压规则设计，导致计划超出 `DIFF-01/DIFF-02`。  
**Why it happens:** 当前代码里 `getEffectiveGameMode()` 已存在，容易继续把更多规则收进同一计划。  
**How to avoid:** Phase 1 只计划四档、默认值、持久化和归一化；更深入的 mode pressure 留给 Phase 2。  
**Warning signs:** 计划里开始出现 `playerCount/lives` 的大段调整说明，且不再围绕 requirements `DIFF-01/DIFF-02`。
</common_pitfalls>

<code_examples>
## Code Examples

### Difficulty definition stays declarative
```javascript
difficulty: {
  order: ['novice', 'easy', 'normal', 'hard'],
  labels: {
    novice: '新手',
    easy: '简单',
    normal: '普通',
    hard: '困难'
  },
  byMode: { duel: 'novice', deathmatch: 'easy' }
}
```

### Normalize persisted difficulty before use
```javascript
function normalizeDifficultyMap(map) {
  const normalized = {};
  Object.keys(CONFIG.gameModes || {}).forEach((modeId) => {
    const fallback = CONFIG.difficulty?.byMode?.[modeId] || 'normal';
    normalized[modeId] = sanitizeDifficulty(map?.[modeId], fallback);
  });
  return normalized;
}
```

### Menu rendering should read from runtime state, not hardcoded labels
```javascript
function updateDifficultyUI() {
  const current = getDifficultyForMode(state.gameMode);
  difficultyButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.diff === current);
  });
  if (difficultyLabelEl) {
    const modeName = getEffectiveGameMode(state.gameMode)?.name || state.gameMode;
    const label = getDifficultyLabel(current);
    difficultyLabelEl.textContent = `${modeName} AI 难度：${label}`;
  }
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2026)

对这个 phase 来说，没有“需要追新”的外部生态变化。真正符合当前项目状态的现代做法，是：

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| 多处硬编码默认值 | 单一配置源 + getter/setter | 更易审阅，也更容易验证 |
| 通过重型状态管理解决简单菜单状态 | 用声明式配置和轻量 DOM 同步 | 更贴合当前单文件浏览器游戏 |
| 一上来补自动化框架 | 先写清 phase-specific 验证矩阵 | 更适合当前改动面和仓库结构 |

**New tools/patterns to consider:**
- 无需新增工具；保持当前浏览器原生能力 + 轻量 smoke 检查即可。

**Deprecated/outdated:**
- 为简单设置项引入过度抽象层，在当前项目里属于过早复杂化。
</sota_updates>

<open_questions>
## Open Questions

1. **Phase 1 是否需要 retroactive planning 视角**
   - What we know: 当前仓库代码已经包含 Phase 1 的大部分实现结果。
   - What's unclear: 后续 execute-phase 是补齐残缺、做验证收口，还是重新按计划实现。
   - Recommendation: Planner 采用“审计现状 + 补缺 + 验证”的最小计划写法，避免假定代码还没动过。

2. **静态 smoke 命令是否需要落成仓库脚本**
   - What we know: 当前仓库没有测试基础设施。
   - What's unclear: 是保持 inline command，还是在未来抽成脚本。
   - Recommendation: 本 phase 先保持 inline command；只有当后续 phase 复用频率明显升高，再考虑抽成脚本。
</open_questions>

## Validation Architecture

- **Current infrastructure:** 仓库没有 `package.json`、没有自动化测试框架、没有现成的 test runner；Phase 1 的验证应以轻量静态 smoke + 手工浏览器矩阵为主。
- **Quick verification:** 每次触碰难度配置或菜单绑定后，运行一个单文件静态 smoke，确认四档按钮、默认值和归一化入口仍在。
- **Full verification:** 在浏览器里验证 `duel` 默认 `novice`、`deathmatch` 默认 `easy`、旧存档兼容、模式切换与重新开局一致性。
- **Why no new framework now:** 当前 phase 改动面集中在 `index.html`，引入 Jest/Vitest/Playwright 基建会把工作重点从“锁定行为和边界”转移到“搭框架”，性价比低。
- **Planner implication:** 计划里至少要有一个专门任务负责验证矩阵，不要把所有验证都塞进实现任务尾部。

<sources>
## Sources

### Primary (HIGH confidence)
- Local code inspection: `index.html` difficulty/menu/persistence functions
- Local planning docs: `01-CONTEXT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md`
- Local codebase maps: `CONVENTIONS.md`, `STRUCTURE.md`, `STACK.md`

### Secondary (MEDIUM confidence)
- None — this phase did not require external ecosystem research

### Tertiary (LOW confidence - needs validation)
- None
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: browser DOM + `localStorage` + single-file game state
- Ecosystem: existing repo patterns only
- Patterns: configuration centralization, mode-scoped persistence, menu/runtime sync
- Pitfalls: drift between UI/runtime, over-scoping Phase 1, incomplete persistence normalization

**Confidence breakdown:**
- Standard stack: HIGH - no new dependency decisions
- Architecture: HIGH - repo already exhibits the target pattern
- Pitfalls: HIGH - directly derived from current code shape and phase boundary
- Code examples: HIGH - copied from current implementation

**Research date:** 2026-03-09
**Valid until:** 2026-04-08
</metadata>

---

*Phase: 01-difficulty-ladder-persistence*
*Research completed: 2026-03-09*
*Ready for planning: yes*
