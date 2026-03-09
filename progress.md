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
