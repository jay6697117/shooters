---
phase: 1
slug: difficulty-ladder-persistence
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-09
---

# Phase 1 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | other - inline static smoke + manual browser verification |
| **Config file** | none - current phase stays inside existing single-file runtime |
| **Quick run command** | `node -e "const fs=require('fs');const html=fs.readFileSync('index.html','utf8');const checks=[/data-diff=\\\"novice\\\"[\\s\\S]*data-diff=\\\"easy\\\"[\\s\\S]*data-diff=\\\"normal\\\"[\\s\\S]*data-diff=\\\"hard\\\"/,/order:\\s*\\['novice', 'easy', 'normal', 'hard'\\]/,/labels:\\s*\\{[\\s\\S]*novice:\\s*'新手'[\\s\\S]*easy:\\s*'简单'[\\s\\S]*normal:\\s*'普通'[\\s\\S]*hard:\\s*'困难'[\\s\\S]*\\}/,/byMode:\\s*\\{ duel: 'novice', deathmatch: 'easy' \\}/,/function normalizeDifficultyMap\\(/,/function getDifficultyForMode\\(/,/function setDifficultyForMode\\(/]; if(!checks.every((re)=>re.test(html))) process.exit(1);"` |
| **Full suite command** | `node -e "const fs=require('fs');const html=fs.readFileSync('index.html','utf8');const checks=[/data-diff=\\\"novice\\\"[\\s\\S]*data-diff=\\\"easy\\\"[\\s\\S]*data-diff=\\\"normal\\\"[\\s\\S]*data-diff=\\\"hard\\\"/,/order:\\s*\\['novice', 'easy', 'normal', 'hard'\\]/,/labels:\\s*\\{[\\s\\S]*novice:\\s*'新手'[\\s\\S]*easy:\\s*'简单'[\\s\\S]*normal:\\s*'普通'[\\s\\S]*hard:\\s*'困难'[\\s\\S]*\\}/,/byMode:\\s*\\{ duel: 'novice', deathmatch: 'easy' \\}/,/function normalizeDifficultyMap\\(/,/function getDifficultyForMode\\(/,/function setDifficultyForMode\\(/,/localStorage\\.setItem\\('tinyToonDuel_aiDifficultyByMode'/]; if(!checks.every((re)=>re.test(html))) process.exit(1);"` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `Quick run command`
- **After every plan wave:** Run `Full suite command`
- **Before `$gsd-verify-work`:** Full suite must be green, then complete manual browser checks
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DIFF-01 | static smoke | `Quick run command` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | DIFF-02 | static smoke | `Full suite command` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | DIFF-01 | static smoke | `Quick run command` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | DIFF-01, DIFF-02 | static smoke | `Full suite command` | ✅ | ⬜ pending |
| 01-02-03 | 02 | 2 | DIFF-01, DIFF-02 | manual | `none - manual browser matrix` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `duel` 首次进入默认落在 `novice` | DIFF-02 | 默认高亮和文案是浏览器可视行为 | 清空 `tinyToonDuel_aiDifficultyByMode` 后刷新菜单，确认 `1v1 对决 AI 难度：新手` 且规则文案同步显示新手档 |
| `deathmatch` 首次进入默认落在 `easy` | DIFF-02 | 需要切模式并检查按钮高亮与文案一致 | 在无存档状态切到 `deathmatch`，确认标签显示 `简单`，按钮高亮落在 `easy`，且不要求额外验证 Phase 2 的人数/生命派生 |
| 旧 `easy/normal/hard` 存档仍可加载 | DIFF-01 | 需要注入旧存档并检查菜单高亮是否恢复 | 预置 `{\"duel\":\"easy\",\"deathmatch\":\"normal\"}` 到 `localStorage`，刷新后检查两模式分别恢复旧值 |
| 模式切换后仍记住各自难度 | DIFF-01 | 需要真实操作菜单状态流转 | 先为 `duel` / `deathmatch` 分别设置不同难度，再来回切模式，确认高亮和标签跟随各自已保存值 |
| 非法存档会静默回退到有效档位 | DIFF-01 | 需要注入非法值并确认 UI 没有额外提示 | 预置 `{\"duel\":\"invalid\",\"deathmatch\":\"hard\",\"extra\":\"ignored\"}` 到 `localStorage`，刷新后确认 `duel` 回到 `novice`、`deathmatch` 维持 `hard`，且菜单未出现错误提示 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or explicit manual verification mapping
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
