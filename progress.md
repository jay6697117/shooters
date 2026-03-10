Original prompt: PLEASE IMPLEMENT THIS PLAN for the v1.0 beginner-friendly difficulty milestone.

## 2026-03-09

- 基线验证：
  - 静态检查确认当前 `index.html` 不存在 `novice` 难度按钮。
  - 静态检查确认当前不存在 `getEffectiveGameMode()` 一类的派生模式入口。
  - 当前 `deathmatch` 人数/生命和菜单文案都直接绑定静态 `CONFIG.gameModes`，还不能按难度变化。
- 执行顺序：
  - 先改 `index.html`：四档难度、默认值、旧存档兼容、`deathmatch` 低难度规则派生、菜单文案同步。
  - 再重写 `.planning` 文档，把当前里程碑改成新手友好难度改造。
- 验证计划：
  - 用本地 HTTP 服务 + 浏览器自动化检查菜单按钮、默认档位、规则文案。
  - 用静态检查确认派生入口与数值表已落地。

## 2026-03-09 Implementation Notes

- `index.html`
  - 新增四档难度顺序和中文标签：`novice / easy / normal / hard`。
  - 默认档位改为 `duel=novice`、`deathmatch=easy`。
  - 旧 `localStorage` 仍走 `tinyToonDuel_aiDifficultyByMode`，并在读取时做合法值归一化。
  - 新增 `getEffectiveGameMode()`，把 `deathmatch` 低难度的人数/生命从静态模式配置改为按难度派生。
  - `deathmatch` 派生规则：
    - `novice`: `playerCount=3`, `lives=5`
    - `easy`: `playerCount=4`, `lives=4`
    - `normal/hard`: 保持 4 人、3 命
  - 菜单副标题、规则文案、难度标签全部改为中文实时同步。
  - 额外修复一个边界：如果同一模式已经激活过，再只切难度重新开局，也会重新应用新的派生人数/生命规则。

- `.planning`
  - `PROJECT.md` / `REQUIREMENTS.md` / `ROADMAP.md` / `STATE.md` 已全部改写为 `v1.0 Beginner-Friendly Difficulty Pass`。
  - 原 gunfeel 方向已明确下放为 `v1.1 candidate`，不再出现在当前 active milestone 范围内。

- 验证结果：
  - 浏览器自动化确认默认 `duel` 文案为 `AI 难度：新手`，规则提示同步显示新手档。
  - 浏览器自动化确认 `deathmatch` 默认 `easy` 时显示 `4 名角色 · 4 条命`。
  - 浏览器自动化确认 `deathmatch` 切到 `novice` 后显示 `3 名角色 · 5 条命`，并且开局 HUD 只有 3 名角色、每人 5 条命。
  - 浏览器自动化确认旧存档 `{\"duel\":\"easy\",\"deathmatch\":\"normal\"}` 重新加载后仍能正确显示旧档位。
  - 浏览器自动化确认 `deathmatch` 切到 `normal` 后显示 `4 名角色 · 3 条命`。
  - `develop-web-game` 客户端已产出过验证截图并完成目检；截图产物已在提交前清理，避免把临时文件带入版本库。
  - Playwright 控制台错误检查结果为 0。

## 2026-03-09 Phase 2.1 Implementation Notes

- `index.html`
  - 在 `attemptFire()` 周围补齐 `resolveShotPellet()`、`commitShotPellet()`、`finalizeShotResult()`、`presentShotFeedback()` 四段式本地 helper，把单次扳机结果收口到 `kill / player_hit / environment_hit / miss`。
  - 新增 HUD 中心确认层 `#shotConfirm`，把 primary confirm 从现有 tracer / muzzle / shake 中独立出来，并保持 `miss` 不走中心确认。
  - 新增 `weaponFeedbackTuning`，按 `duel / deathmatch × pistol / smg / shotgun` 集中管理持续时间、opacity、pulse、hitstop、flash、shake 和 throttle。
  - `shotgun` 已按 trigger-level 聚合，只会给出一个主确认；`smg` 在 `deathmatch` 下采用更严格节流，避免中心 HUD 噪音失控。
  - `applyDamage()` 现在只返回 kill promotion，不再隐式承担 shooter-side confirm；同时补回“玩家被 AI 打中”时的 defender-side `hitFlash`，避免受击反馈回归。
  - 新增 `window.render_game_to_text` 的 Phase 2.1 扩展观测字段：`lastShotFeedback`、`lastNearMiss`、`barrels`、`cover`。
  - 新增 `window.phase21TestApi`，用于本地浏览器内稳定复现实验场景：`startMatch()`、`setPlayerWeapon()`、`setEntityHp()`、`firePlayerAtTeam()`、`firePlayerAtBarrel()`、`firePlayerAtCover()`、`firePlayerNearMiss()`；当场景布置失败时会显式返回 `phase21Action.ok=false` 和 `reason`，避免验证假阳性。

- `.planning`
  - 新增 `02.1-01-PLAN.md`、`02.1-02-PLAN.md`、`02.1-03-PLAN.md`，把插队 phase 拆成 3 个串行 execute plans。

- 验证计划
  - 静态检查继续覆盖 HUD 节点、shot helper seam、feedback router、test hook 暴露。
  - 浏览器验证改为优先使用 `phase21TestApi` 复现 `player_hit / kill / environment_hit / miss`，再补充 `duel` 与 `deathmatch` 的体感目检。

## 2026-03-09 Phase 2.1 Final Verification

- 为了让浏览器验证真正 deterministic，`phase21TestApi` 追加了两个 phase-local helper：`setEntityPosition()` 与 `firePlayerAtPoint()`；这些 helper 默认启用 `zeroSpread`，只影响验证入口，不影响正式玩法射击散布。
- 最终稳定验证坐标：
  - 直接命中 lane：`p1=(-10,-7)`，`p2=(-10,-3)`
  - near-miss lane：`p1=(-6,-7)`，`p2=(-10,-3)`，aim `(-9.5050,-2.5050)`
- 最终验证结果：
  - `duel + pistol`：普通命中稳定给出 `player_hit`，击杀稳定给出 `kill`，`kill` 在 final-round `killCam` 切入时仍保持可见。
  - `duel + barrel / cover`：两者都稳定走 `environment_hit`，标签为弱化的 `CLANG`，不会伪装成人物命中。
  - `duel + near-miss`：稳定走 `miss`，`lastNearMiss` 被记录，且 `shotConfirm === null`、`shotFeedbackEventCount === 0`。
  - `duel + shotgun`：单次 trigger pull 只产生一个 primary confirm event，`shotFeedbackEventCount === 1`。
  - `deathmatch + smg`：4 次快速连射命中把 `p2.hp` 从 `65` 打到 `33`，但 `shotFeedbackEventCount` 始终保持 `1`，证明节流有效。
  - reset 路径：post-kill round reset、restart、menu load 都会把 `shotConfirm / shotFeedbackEventCount / lastShotFeedback / lastNearMiss` 清空。
  - Playwright 控制台错误数：`0`。

- 2026-03-10 visual pass:
- Added failing contract test for visual system module + runtime seams, then implemented src/visual-tuning.js.
- Reworked menu/HUD presentation, introduced unified presentCombatFeedback(), visual event log, visualState snapshot, and window.advanceTime().
- Fixed attemptFire shotVisual scope bug found during browser validation.
- Verified via browser: contract test green; duel hit/kill, deathmatch density, damage_taken, near_miss, low_hp visualState all observed.
- Ran develop-web-game Playwright client against http://127.0.0.1:4173/index.html and reviewed output/visual-pass-client/shot-0.png + state-0.json; no client error file generated.

- 2026-03-10 visual pass round 2:
- Added severity-first danger tuning in `src/visual-tuning.js`: `dangerSeverityOrder`, `eventSeverityMap`, `dangerSeverityMatrix`, and helpers for runtime severity resolution.
- Reworked `index.html` combat feedback flow so `presentCombatFeedback()` resolves `pressure / warning / critical / swing` before driving badge, timer, combatFeed, screenPulse, vignette, and camera response.
- Extended runtime state with `severity`, `persistentDanger`, `lastDangerSource`, and `activeLayers`; `phase21TestApi` now includes `triggerRoundTransition()` for swing validation without expanding into a generic debug surface.
- Fixed reset leakage from round-one visuals by clearing persistent danger, `lowHpVignette`, and pulse/feed severity metadata during feedback resets.
- Verification results:
  - `node --test scripts/visual-system.contract.test.mjs` passed after the second-round contract expansion.
  - Browser validation via `phase21TestApi` confirmed:
    - `damage_taken -> pressure`
    - `firePlayerNearMiss() -> warning`
    - `low_hp -> critical` with `persistentDanger=true`
    - healing back above threshold clears persistent danger and returns to `calm`
    - `kill` and `triggerRoundTransition()` both resolve to `swing`
    - `deathmatch` still reports `density=compact` and resets danger state to `calm`
  - Playwright console error count remained `0`.
  - Ran develop-web-game client against http://127.0.0.1:4173/index.html with `Enter` choreography and reviewed `output/visual-pass-client-round2/shot-0.png` + `state-0.json`; no `errors-0.json` was produced.

- 2026-03-10 visual pass round 3:
- Split danger presentation into foreground/background tracks in `index.html` so `swing` owns feed/pulse/camera while persistent `critical` owns badge/timer/vignette; `low_hp` no longer steals foreground conclusion space from kill or round-transition events.
- Expanded `src/visual-tuning.js` with track-aware danger envelopes and priorities: `dangerLayerPriority`, per-severity pulse/feed/vignette/camera fields, and `deathmatch` foreground scaling while preserving persistent `critical` behavior.
- Extended `render_game_to_text().visualState` with `foregroundSeverity`, `backgroundSeverity`, and `layerSeverities`, while keeping `severity` as the compatibility facade for existing consumers.
- Added `phase21TestApi.resetVisualState()` as a narrow verification seam and created `scripts/visual-system.browser.test.mjs` to lock eight browser scenarios plus screenshot/json artifacts into a repeatable regression pass.
- Fixed the overlap regression discovered during browser automation: `firePlayerAtTeam()` resets feedback by default, so the overlap scenario now opts into `{ resetFeedback: false }` to preserve background `critical` while asserting foreground `swing`.
- Verification results:
  - `node --test scripts/visual-system.contract.test.mjs` passed with the round-three static/runtime seam checks.
  - `node scripts/visual-system.browser.test.mjs --url http://127.0.0.1:4173/index.html --out-dir output/visual-regression` passed all 8 scenarios and produced `results.json`, `critical.png`, and `critical-plus-swing.png`.
  - `runtimeErrors` from the browser regression run remained empty, and Playwright console/page error count stayed `0`.
  - Ran develop-web-game client against http://127.0.0.1:4173/index.html and reviewed `output/visual-pass-client-round3/shot-0.png` + `state-0.json`; no `errors-0.json` was produced.
