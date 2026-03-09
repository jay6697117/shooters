# Phase 1: Difficulty Ladder & Persistence - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把四档难度体系和默认进入体验做清楚：玩家能在菜单中看到并选择 `novice`、`easy`、`normal`、`hard`，系统会按模式记住他们的选择，并在首次进入时落到更友好的推荐默认值。

本阶段不扩展新的玩法能力，也不讨论 `deathmatch` 低难度的人数/生命压力设计细节；那是 Phase 2 的范围。

</domain>

<decisions>
## Implementation Decisions

### 菜单信息密度
- 保持当前轻量表达：继续使用“模式副标题 + 一行规则”的结构。
- 不为每个难度再增加单独的解释面板、帮助区或说明卡片。

### 默认档位呈现
- 推荐默认值只通过当前预选状态和现有文案传达。
- 不额外增加“推荐”“首次游玩建议”之类的徽标或强提示。

### 存档回退反馈
- 旧存档或非法存档在回到有效档位时采用静默回退。
- 不弹提示，不额外增加菜单内提示条，优先保持菜单干净。

### 难度记忆策略
- 各模式难度长期保存在浏览器本地，直到玩家主动修改。
- 不做“仅本次会话生效”或“每次打开恢复推荐默认值”的策略。

### Claude's Discretion
- 当前轻量文案下的具体措辞可以微调，但不能改变“轻量、无额外帮助块”的方向。
- 非法存档的具体归一化顺序和内部容错实现由 Claude 自行决定，只要用户看到的是静默回退。

</decisions>

<specifics>
## Specific Ideas

- 用户明确选择“锁定现状”，表示当前 Phase 1 不再扩展菜单交互复杂度。
- 当前实现已经形成用户期望：四档按钮直接可点，默认档位通过预选高亮体现，不做更多教学式引导。

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CONFIG.difficulty.order` / `labels` / `byMode`：已经承载四档顺序、显示标签和按模式默认值，可继续作为 Phase 1 的单一配置入口。
- `setupDifficultySelect()` / `setDifficultyForMode()` / `updateDifficultyUI()`：已经形成菜单按钮绑定、持久化写入和高亮更新链路。
- `normalizeDifficultyMap()` / `getDifficultyForMode()`：已经提供旧存档归一化和按模式读取难度的复用点。

### Established Patterns
- 应用主逻辑集中在 `index.html` 单个 `<script type="module">` 中；Phase 1 新增或调整行为应继续沿用相邻函数簇集中维护的模式。
- 当前项目偏向配置驱动和守卫式回退：非法值直接回到默认，不通过弹窗或日志打断用户。
- 玩家偏好已经通过 `localStorage` 长期持久化，Phase 1 应延续这种“记住上次选择”的用户体验。

### Integration Points
- 菜单 UI：`#difficultySelect`、`.difficultyBtn`、`#difficultyLabel`
- 本地持久化：`tinyToonDuel_aiDifficultyByMode`
- 初始化链路：启动时读取 `localStorage`，归一化后写回运行时 `CONFIG.difficulty.byMode`
- 开局前同步：`setGameMode()` / `updateDifficultyUI()` / `startMatch()` 共同决定玩家在进入对局前看到和使用的难度状态

</code_context>

<deferred>
## Deferred Ideas

- 为当前默认档位增加“推荐”徽标或“首次游玩建议”提示
- 为每个难度增加更详细的说明文本或帮助区
- 对非法存档回退增加用户可见提示

这些都不阻碍本阶段完成，后续如需增强引导，可作为单独优化讨论。

</deferred>

---

*Phase: 01-difficulty-ladder-persistence*
*Context gathered: 2026-03-09*
