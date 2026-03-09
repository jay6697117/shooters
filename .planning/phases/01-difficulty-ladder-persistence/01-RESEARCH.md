# Phase 1: Difficulty Ladder & Persistence - Research

**Researched:** 2026-03-09
**Domain:** 单文件浏览器游戏中的难度配置、默认值与按模式持久化规划
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

### Phase Scope Guardrails
- 本阶段只覆盖 `DIFF-01` 与 `DIFF-02`，即四档难度可选、按模式持久化、首次进入默认值更友好。
- `MODE-01` 与 `UX-01` 的“实际规则同步”属于 Phase 2，不应在本阶段引入新的规则派生目标。
- `BAL-01` 的 AI 数值收敛属于 Phase 3，本阶段不应扩展成大规模平衡重调。
- 不引入新依赖、不做模块拆分、不建立自动化测试基建。
</user_constraints>

<research_summary>
## Summary

本次研究不是外部库选型，而是确认在当前单文件 `index.html` + 浏览器 `localStorage` 的现有架构下，Phase 1 最稳妥的规划方式是什么。代码库已经具备这类功能所需的关键骨架：`CONFIG.difficulty` 作为难度元数据入口，`normalizeDifficultyMap()` 负责归一化，`setDifficultyForMode()` / `getDifficultyForMode()` / `updateDifficultyUI()` 构成菜单与持久化链路。因此，Phase 1 不需要新增技术栈，重点是把计划拆分得足够清楚，避免把 Phase 2 的规则派生和 Phase 3 的平衡收敛提前混入。

从需求和现状看，最合理的规划方式是围绕“单一真相源 + 单一路径归一化 + 单一写入入口”组织计划。默认值应只来自 `CONFIG.difficulty.byMode`；合法难度集合应只来自 `CONFIG.difficulty.order`；旧存档兼容应继续依赖静默 JSON 解析和按模式回退，不要引入新的迁移层。这样可以保持变更局部、可审阅，并且与当前项目“守卫式回退、轻量 UI、不打断用户”的风格一致。

对 planner 最有价值的建议是把本阶段拆成 2 个可执行 plan，并把验证继续留在独立的 `01-VALIDATION.md` 中：先锁定配置与归一化边界，再锁定菜单交互与持久化链路。这样既能覆盖 `DIFF-01/02`，又能避免在一个 plan 里同时处理配置、UI、模式规则和验证，导致 phase 边界失焦，同时也不会为了当前单文件仓库再人为拆出一个“验证专用第三 plan”。

**Primary recommendation:** 以 `CONFIG.difficulty` 和 `tinyToonDuel_aiDifficultyByMode` 为唯一规划中心，把 Phase 1 拆成“元数据/归一化”“菜单/持久化”两个 plan，并明确要求验证矩阵继续由 `01-VALIDATION.md` 承载，禁止扩展到 Phase 2 的规则同步。
</research_summary>

<standard_stack>
## Standard Stack

本 phase 的“标准栈”不是新增库，而是继续使用仓库现有能力。

### Core
| Component | Current Form | Purpose | Why Standard Here |
|-----------|--------------|---------|-------------------|
| `index.html` module script | 单文件浏览器 ES module | 容纳配置、状态、DOM wiring 和 helper | 与当前项目结构一致，最小变更成本最低 |
| `CONFIG.difficulty` | 内联配置对象 | 难度顺序、标签、默认值、预设参数的真相源 | 已存在且天然适合承载 Phase 1 规划 |
| `localStorage` | Browser Web API | 按模式持久化玩家难度偏好 | 现有用户体验已基于此建立，不需要替换 |
| Menu DOM controls | `#difficultySelect`、`.difficultyBtn`、`#difficultyLabel` | 提供菜单选择、高亮和标签显示 | UI 已存在，只需保持一致性 |

### Supporting
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| `normalizeDifficultyMap()` | 对无效值、缺失值和旧存档做静默归一化 | 启动读取存档、恢复运行时默认值时 |
| `getDifficultyForMode()` | 从按模式映射中读取有效难度 | 任何需要读取当前模式难度的地方 |
| `setDifficultyForMode()` | 单一持久化写入入口 | 菜单点击后更新状态与本地存储 |
| `updateDifficultyUI()` | 同步按钮高亮与标签文字 | 模式切换、难度切换、初始化完成后 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 单个 `tinyToonDuel_aiDifficultyByMode` JSON object | 每个模式单独一个 `localStorage` key | 增加读取、写入和迁移复杂度，没有明显收益 |
| 单文件局部调整 | 先拆出 settings module | 架构收益不足以覆盖 phase 成本，会扩大 review 面 |
| 手工验证矩阵 | 引入 `Vitest` / `Playwright` / npm scripts | 仓库当前没有测试基建，本 phase 逻辑太小，不值得先建脚手架 |

**Installation:**
```bash
# No dependency changes are recommended for this phase.
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
index.html
  CONFIG.difficulty           # canonical order, labels, by-mode defaults
  storage bootstrap           # read localStorage and normalize once
  setupDifficultySelect()     # bind difficulty button clicks
  getDifficultyForMode()      # mode-scoped reads
  setDifficultyForMode()      # mode-scoped writes + persistence
  updateDifficultyUI()        # active button state + label text
```

### Planner-Oriented Plan Breakdown
| Plan | Goal | Depends On | Safe Boundary | Must Not Expand Into |
|------|------|------------|---------------|----------------------|
| Plan A: Difficulty Metadata & Normalization | 明确四档顺序、中文标签、按模式默认值、合法值校验和旧存档归一化 | Nothing | `CONFIG.difficulty`、读取存档、helper 函数 | `deathmatch` 规则人数/生命派生 |
| Plan B: Menu Interaction & Persistence Wiring | 保证按钮点击、模式切换、标签更新、按模式长期记忆一致 | Plan A | `setupDifficultySelect()`、`setGameMode()`、`updateDifficultyUI()`、`setDifficultyForMode()` | 新帮助区、推荐徽标、复杂说明 UI |

验证矩阵不再单独拆成 Plan C，而是继续放在 `01-VALIDATION.md` 里，为两份执行 plan 提供 quick/full/manual 采样策略。

### Pattern 1: Single Source of Truth for Difficulty Metadata
**What:** 难度顺序、显示名称、默认值必须都从 `CONFIG.difficulty` 读取，而不是散落在多个 handler、文案函数和初始化分支里。
**When to use:** 任何涉及难度合法性、默认值或显示标签的规划与实现。
**Example:**
```javascript
function getAllowedDifficulties() {
  return CONFIG.difficulty?.order || ['novice', 'easy', 'normal', 'hard'];
}

function getDifficultyLabel(difficulty) {
  return CONFIG.difficulty?.labels?.[difficulty] || difficulty;
}
```

### Pattern 2: Normalize on Bootstrap, Sanitize on Access
**What:** 启动时先把默认映射归一化，再在读取存档后进行一次 merge + normalize；访问单个 mode 时继续走 accessor 防御。
**When to use:** 处理首次进入、旧存档兼容、非法值静默回退。
**Example:**
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

### Pattern 3: One Write Path Per Mode
**What:** 菜单点击后只通过 `setDifficultyForMode()` 更新映射并写入 `localStorage`，不要在多个 UI 分支直接 `localStorage.setItem(...)`。
**When to use:** 规划菜单切换、模式切换、默认高亮时的状态流。
**Example:**
```javascript
function setDifficultyForMode(modeId, difficulty) {
  if (!modeId) return;
  const resolvedModeId = CONFIG.gameModes?.[modeId] ? modeId : null;
  if (!resolvedModeId || !isValidDifficulty(difficulty)) return;
  CONFIG.difficulty.byMode[resolvedModeId] = difficulty;
  localStorage.setItem('tinyToonDuel_aiDifficultyByMode', JSON.stringify(CONFIG.difficulty.byMode));
  updateMenuModeCopy();
  updateDifficultyUI();
}
```

### Anti-Patterns to Avoid
- **Duplicated defaults:** 不要在 `CONFIG.difficulty.byMode` 之外再维护第二套首次默认值，否则 `duel` / `deathmatch` 可能出现默认档漂移。
- **Phase bleed:** 不要把 `getEffectiveGameMode()` 的规则派生继续扩展成 Phase 1 主任务，否则会把 Phase 2 的成功标准提前混入。
- **UI overbuild:** 不要为了“新手友好”引入帮助区、推荐徽标、二级说明卡片，这与已锁定的轻量菜单方向冲突。
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 旧存档兼容 | 自定义迁移版本系统 | 继续使用 `JSON.parse` + `normalizeDifficultyMap()` + 静默回退 | 当前存储结构只是一个小型模式映射，没有复杂 schema 演进需求 |
| 难度状态管理 | 新的 settings store / event bus | 复用 `CONFIG.difficulty` + 现有 `state.gameMode` + UI refresh helpers | 单文件项目里再造状态层只会放大变更面 |
| 难度按钮生成 | 动态模板系统或组件抽象 | 保持现有固定四按钮结构 | 选项固定且已存在，动态生成带来的复杂度高于收益 |
| 验证基建 | 本 phase 内补一整套测试框架 | 手工验证矩阵 + 静态 HTTP 服务 | 逻辑范围小，基础设施改动会喧宾夺主 |

**Key insight:** 当前 phase 的复杂点不是“技术实现难”，而是“边界和一致性容易失控”。因此应避免手搓额外架构，把变化尽量锁在已有配置、helper 和菜单 wiring 内。
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Default Value Drift Across Bootstrap and Accessors
**What goes wrong:** 首次进入默认值看似改对了，但某些读取路径仍回到旧默认值，导致按钮高亮、标签或启动后的运行时状态不一致。
**Why it happens:** 默认值同时存在于初始化代码、accessor fallback、UI 文案函数等多个位置。
**How to avoid:** 规划时明确 `CONFIG.difficulty.byMode` 是唯一默认值来源，所有 fallback 都引用它。
**Warning signs:** 清空存档后 `duel` 和 `deathmatch` 某一方仍显示旧档位；模式切换后标签变化异常。

### Pitfall 2: Partial Storage Writes Overwrite Mode Memory
**What goes wrong:** 玩家只修改了一个模式的难度，却意外丢失另一个模式的已保存选择。
**Why it happens:** 写入时序列化的是局部对象、临时变量或未归一化的片段，而不是完整的 `byMode` map。
**How to avoid:** 规划中把 `setDifficultyForMode()` 定义为唯一写入入口，并始终序列化完整映射。
**Warning signs:** `duel` 与 `deathmatch` 来回切换后，先前选择莫名重置。

### Pitfall 3: Invalid Storage Handling Becomes User-Facing Noise
**What goes wrong:** 为了“更安全”而增加提示条、日志或弹窗，反而破坏菜单简洁度，并违背 CONTEXT.md 锁定决策。
**Why it happens:** 把技术容错误当成用户必须感知的状态变更。
**How to avoid:** 保持当前风格，非法值仅在内部静默回退到有效档位。
**Warning signs:** 菜单出现额外提示文案，或 planner 把“存档修复提示”写进执行计划。

### Pitfall 4: Phase 1 Plan Accidentally Absorbs Phase 2
**What goes wrong:** 因为当前代码已经存在 `getEffectiveGameMode()` 和 `modeOverrides`，规划时顺手把规则派生、人数/生命同步也算进了 Phase 1。
**Why it happens:** 代码现状与 roadmap 边界不完全一致，容易让 planner 误判当前 phase 的目标。
**How to avoid:** 在 plan 边界中明确只为 `DIFF-01/02` 服务，Phase 2 的规则一致性只作为“不要破坏”的回归点，而不是本 phase 的交付目标。
**Warning signs:** plan 标题出现 `deathmatch pressure`、`mode overrides`、`effective rules` 等词。

### Pitfall 5: Validation Fails Under `file://`
**What goes wrong:** 本地直接双击 `index.html`，导致 `fetch('./assets.json')` 或资源路径失败，从而把验证噪音误判成难度功能问题。
**Why it happens:** 项目依赖浏览器静态 HTTP 上下文，而不是纯文件协议。
**How to avoid:** 统一要求通过静态 HTTP 服务验证本 phase。
**Warning signs:** 控制台出现资源加载失败，但菜单逻辑本身未必有问题。
</common_pitfalls>

<validation_architecture>
## Validation Architecture

### Available Test Infrastructure
- 仓库当前未检测到 `package.json`、测试目录、测试 runner、CI 测试脚本或现成的自动化 harness。
- 当前可依赖的验证基础设施只有：静态 HTTP 服务、浏览器 DevTools、`localStorage`、现有菜单与对局入口。
- 因为项目运行依赖 `fetch('./assets.json')` 与本地资源路径，验证必须在 HTTP 上下文中进行，不能依赖 `file://`。

### Recommended Quick Validation Commands
先启动一个最轻量的静态服务：

```bash
cd /Users/zhangjinhui/Desktop/shooters
python3 -m http.server 4173
```

然后在浏览器打开：

```text
http://127.0.0.1:4173
```

Quick 验证应只覆盖最关键的 `DIFF-01/02`：
- 清空 `tinyToonDuel_aiDifficultyByMode` 后刷新，确认 `duel` 默认是 `novice`、`deathmatch` 默认是 `easy`
- 确认四档按钮顺序固定为 `novice → easy → normal → hard`
- 确认标签显示为中文 `新手 / 简单 / 普通 / 困难`
- 在两个模式间来回切换，确认每个模式记住上次选择

### Recommended Full Validation Commands
终端命令仍然是同一个静态服务；Full 验证主要增加浏览器控制台中的存档注入场景：

```bash
cd /Users/zhangjinhui/Desktop/shooters
python3 -m http.server 4173
```

浏览器控制台建议准备以下片段：

```javascript
localStorage.removeItem('tinyToonDuel_aiDifficultyByMode');
location.reload();
```

```javascript
localStorage.setItem(
  'tinyToonDuel_aiDifficultyByMode',
  JSON.stringify({ duel: 'easy', deathmatch: 'normal' })
);
location.reload();
```

```javascript
localStorage.setItem(
  'tinyToonDuel_aiDifficultyByMode',
  JSON.stringify({ duel: 'invalid', deathmatch: 'hard', extra: 'ignored' })
);
location.reload();
```

Full 验证应覆盖：
- 首次进入默认值
- 旧版合法存档 `easy/normal/hard` 仍能加载
- 非法值和多余字段会静默回退，不产生用户可见提示
- 模式切换与难度切换组合后，持久化结果仍然按模式隔离

### Behaviors That Are Manual-Only in This Phase
- 按钮高亮是否与当前模式的已选难度一致
- 模式切换后标签文案是否立即更新
- 静默回退是否“没有任何多余提示”
- 玩家从菜单进入对局前看到的默认值是否符合首次体验预期

这些行为都依赖真实浏览器中的 DOM 状态、`localStorage` 与用户可见反馈；在当前仓库没有测试 runner 和稳定 UI harness 的前提下，手工验证是更低风险的选择。

### Why This Phase Can Skip a Test Framework
- 逻辑面很小，主要是配置、归一化和菜单 wiring；引入测试框架的工程量会明显大于本 phase 业务改动本身。
- 仓库当前没有 npm-based toolchain，补测试框架意味着连同依赖管理、脚本、运行环境一起引入，超出 `DIFF-01/02` 目标。
- 后续如果多个 phase 都开始频繁回归同一组 UI/存储行为，再考虑统一补自动化更合理；Phase 1 先把验证矩阵写清即可。
</validation_architecture>

<code_examples>
## Code Examples

### Bootstrap Storage Merge Pattern
```javascript
CONFIG.difficulty.byMode = normalizeDifficultyMap(CONFIG.difficulty.byMode);

const storedDifficulty = localStorage.getItem('tinyToonDuel_aiDifficultyByMode');
if (storedDifficulty) {
  try {
    const parsed = JSON.parse(storedDifficulty);
    if (parsed && typeof parsed === 'object') {
      CONFIG.difficulty.byMode = normalizeDifficultyMap({
        ...CONFIG.difficulty.byMode,
        ...parsed,
      });
    }
  } catch {}
}
```

### Mode-Scoped Read Pattern
```javascript
function getDifficultyForMode(modeId) {
  const resolvedModeId = CONFIG.gameModes?.[modeId] ? modeId : 'duel';
  const byMode = CONFIG.difficulty?.byMode || {};
  const fallback = CONFIG.difficulty?.byMode?.[resolvedModeId] || 'normal';
  return sanitizeDifficulty(byMode[resolvedModeId], fallback);
}
```

### UI Refresh Pattern
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
## State of the Art (2024-2025)

这一 phase 没有需要追逐的新生态变化，浏览器 `localStorage`、DOM 事件和内联配置对象都属于稳定能力。这里更重要的是遵循当前仓库的成熟局部模式，而不是引入“更新的”框架或状态管理方案。

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 会话级、单模式、临时默认值 | 按模式持久化的难度映射 | 当前仓库已采用 | Phase 1 应继续巩固，而不是回退到临时状态 |
| 文案直接拼写枚举值 | `order + labels + byMode` 配置驱动 | 当前仓库已采用 | 减少 UI 与存储逻辑分叉 |

**New tools/patterns to consider:**
- None for this phase. 重点是维持最小变更和清晰 plan 边界。

**Deprecated/outdated:**
- 为这种小型浏览器设置逻辑单独引入重型状态管理或测试框架，在当前仓库里都属于过度设计。
</sota_updates>

<open_questions>
## Open Questions

1. **Planner 是否需要处理当前代码中已存在的 Phase 2 痕迹？**
   - What we know: `index.html` 已存在 `getEffectiveGameMode()` 和 `modeOverrides`。
   - What's unclear: 后续 planner 是否会把这些现状误解成 Phase 1 目标的一部分。
   - Recommendation: 明确把它们标注为“现有背景，不要继续扩展”；Phase 1 plan 只需要确保不破坏现状即可。

2. **按钮是否需要从配置动态生成？**
   - What we know: 当前 HTML 已固定四个按钮，顺序与中文标签也已具备。
   - What's unclear: planner 可能会考虑进一步“去重复”而生成按钮。
   - Recommendation: 本 phase 保持静态按钮；四个选项是固定集合，动态生成不会带来足够收益。

3. **VALIDATION.md 是否应直接包含 DevTools 场景脚本？**
   - What we know: 本 phase 最关键的回归点就是首次进入、旧存档和非法存档。
   - What's unclear: planner 生成验证文档时是否会只写口头检查项。
   - Recommendation: 应把本研究中的 `localStorage` 注入片段带入 `VALIDATION.md`，因为这是当前仓库最实用的验证方式。
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `/.planning/phases/01-difficulty-ladder-persistence/01-CONTEXT.md` - 锁定决策、边界和延后项
- `/.planning/REQUIREMENTS.md` - `DIFF-01` / `DIFF-02` 与 phase 映射
- `/.planning/STATE.md` - 当前 focus、blockers 和无测试基建现状
- `/.planning/ROADMAP.md` - Phase 1 success criteria 与 phase 依赖关系
- `/.planning/codebase/CONVENTIONS.md` - 单文件架构、静默回退和命名风格
- `/.planning/codebase/STRUCTURE.md` - 仓库结构与“新逻辑应继续放在 index.html 相邻函数簇”
- `/.planning/codebase/STACK.md` - 浏览器 runtime、无测试框架、适合静态 HTTP 运行
- `/index.html` - 当前难度配置、归一化、持久化和菜单 wiring 实现

### Secondary (MEDIUM confidence)
- `/.codex/get-shit-done/templates/research.md` - 研究文档结构要求
- `/.codex/get-shit-done/workflows/plan-phase.md` - `## Validation Architecture` 对后续 `VALIDATION.md` 生成的重要性

### Tertiary (LOW confidence - needs validation)
- None. 本研究完全基于仓库现状和 phase 文档，不依赖外部不稳定信息。
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: 浏览器 `localStorage` + 单文件 UI 状态流
- Ecosystem: 当前仓库内的 `index.html` / `.planning` 文档，不新增第三方依赖
- Patterns: 配置驱动、启动归一化、按模式读写、轻量手工验证
- Pitfalls: 默认值漂移、部分写入覆盖、phase 边界串线、`file://` 验证误判

**Confidence breakdown:**
- Standard stack: HIGH - 完全基于仓库已存在能力，无外部假设
- Architecture: HIGH - 当前代码已展示清晰的难度 helper 与单文件组织方式
- Pitfalls: HIGH - 直接来自当前 phase 边界与现有代码形态
- Code examples: HIGH - 取自仓库现有实现模式

**Research date:** 2026-03-09
**Valid until:** 2026-04-08
</metadata>

---

*Phase: 01-difficulty-ladder-persistence*
*Research completed: 2026-03-09*
*Ready for planning: yes*
