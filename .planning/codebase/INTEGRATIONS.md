# External Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected

**External APIs:**
- `UNPKG` - 通过 import map 提供 `three@0.160.0` 和 `three/addons` 的浏览器 ESM 模块
  - Integration method: native browser ES module imports from `https://unpkg.com/...`
  - Auth: None detected
  - Rate limits: Not detected
- `Google Fonts` - 通过 CSS `@import` 提供 UI 字体样式
  - Integration method: stylesheet import from `https://fonts.googleapis.com/...`
  - Auth: None detected
  - Rate limits: Not detected
- 补充说明：`assets.json` 与 `assets/` 下的本地 glTF/png 资源属于同源静态文件，不是外部集成

## Data Storage

**Databases:**
- Not detected

**File Storage:**
- Not detected - 未发现 S3、GCS、Supabase Storage 等外部对象存储
  - Note: 运行时会读取同源静态文件 `assets.json` 和 `assets/...`，这些是应用内资源，不属于外部存储集成

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Not detected

**OAuth Integrations:**
- Not detected

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Analytics:**
- Not detected

**Logs:**
- Not applicable - 未检测到外部日志平台；调试能力主要依赖浏览器 console 和 devtools

## CI/CD & Deployment

**Hosting:**
- Not detected - 仓库根目录未发现特定托管平台配置文件
  - Deployment: Not detected
  - Environment vars: Not applicable

**CI Pipeline:**
- Not detected - 仓库根目录未发现 `.github/workflows` 或其他 CI 配置

## Environment Configuration

**Development:**
- Required env vars: None detected
- Secrets location: Not applicable
- Mock/stub services: Not applicable
- Local persistence note: 浏览器 `localStorage` 使用 `tinyToonDuel_visualMode`、`tinyToonDuel_bestWinSeconds`、`tinyToonDuel_aiDifficultyByMode` 保存本地状态；这不是外部集成

**Staging:**
- Not detected

**Production:**
- Secrets management: Not applicable
- Failover/redundancy: Not detected
- Availability dependency: 若未将远程依赖 vendoring 到本地，模块加载与字体加载受 `unpkg.com` 和 `fonts.googleapis.com` 可用性影响

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

---

*Integration audit: 2026-03-09*
*Update when adding/removing external services*
