# Coding Conventions

**Analysis Date:** 2026-03-09

## Scope

- 本文基于仓库当前状态编写，主要依据是 `index.html`，辅以 `assets.json`。
- 主应用逻辑集中在单个 `index.html` 文件中；未检测到拆分后的应用源码目录或多模块源码结构。

## Naming Patterns

**Files:**
- 应用源码文件当前只有 `index.html`。
- 资源清单位于 `assets.json`。
- 未检测到仓库内部应用源码的多文件命名约定，因为主逻辑没有拆分成多个 `.js` 文件。
- `assets/` 下资源文件大量使用 `PascalCase`、下划线和分类目录；这更像资源包命名，而不是应用代码约定。

**Functions:**
- 自定义函数命名使用 `camelCase`，如 `setupRenderer`、`loadAssets`、`applyDamage`、`updateCameraFx`。
- 函数前缀有明显语义分组：`setup*`、`update*`、`create*`、`spawn*`、`reset*`、`clear*`、`get*`、`find*`、`apply*`、`toggle*`、`format*`。
- DOM 事件多数直接使用匿名箭头函数挂在 `addEventListener` 上，而不是统一抽成 `handle*` 处理器；但业务事件函数里也存在 `handleEntityDeath`、`handleDeathmatchDeath` 这种命名。

**Variables:**
- 普通变量、DOM 引用、局部状态使用 `camelCase`，如 `visualToggleBtn`、`bestTimeEl`、`spawnPoints`。
- 顶层常量配置使用 `UPPER_SNAKE_CASE`，如 `BASE_ARENA`、`CONFIG`、`COLORS`、`SPAWN_POINTS`。
- 运行时共享容器倾向于使用简短小写名词：`state`、`settings`、`fx`、`assets`、`world`、`input`。

**Types:**
- 未检测到 TypeScript。
- 未检测到接口、类型别名、枚举或自定义类定义。

## Code Style

**Formatting:**
- 格式化工具：Not detected。
- `index.html` 的大部分 CSS 和 JavaScript 视觉上以 2 空格缩进为主，但文件中实际存在 `tab` 与空格混用，缩进并不完全一致。
- JavaScript 字符串主要使用单引号；HTML 属性、`importmap` JSON 和标准 HTML 标记使用双引号。
- 语句结尾普遍保留分号。
- 多行对象和数组中常见尾随逗号。
- 未检测到明确的行宽限制；配置对象里存在较长单行。

**Linting:**
- Lint 工具：Not detected。
- ESLint 配置：Not detected。

## Import Organization

**Order:**
1. 通过 `<script type="importmap">` 声明 CDN 模块映射。
2. 在 `<script type="module">` 中先导入核心库 `three`。
3. 再导入 addon 子模块 `GLTFLoader` 与 `SkeletonUtils`。

**Grouping:**
- 导入数量很少，没有额外分组空行策略需求。
- 未检测到按字母排序的约束。

**Path Aliases:**
- 应用代码没有本地路径别名。
- 第三方依赖通过 `importmap` 别名 `three` 和 `three/addons/` 访问。

## Error Handling

**Patterns:**
- 错误处理偏轻量，主要依赖守卫式返回和存在性检查，例如 `if (!visualToggleBtn || !visualToggleLabel) return;`。
- 资源缓存和 DOM 访问普遍先判断是否可用，再继续执行。
- `try/catch` 只明确检测到一处：解析 `localStorage` 中的难度配置 JSON，并使用空 `catch {}` 静默失败。
- 未检测到 `throw new Error(...)` 或自定义错误类型模式。

**Error Types:**
- 对可恢复的小问题更倾向于跳过或保留默认值，而不是显式抛错。
- `fetch('./assets.json')`、`GLTFLoader` 加载和初始化流程未检测到用户可见的失败恢复 UI。
- 资源缺失时经常回退到 placeholder mesh，而不是中断流程。

## Logging

**Framework:**
- 日志框架：Not detected。
- `console.log`、`console.warn`、`console.error`：在 `index.html` 中未检测到。

**Patterns:**
- 当前代码不依赖运行时日志来表达状态迁移。
- 调试信息更常通过 HUD、overlay、banner 和 popup 反馈到界面。

## Comments

**When to Comment:**
- 注释数量不多，但多数在解释“为什么这样做”，例如镜头位置、命中盒调节、资源分组、清理顺序、动画切换和空间计算假设。
- 常见形式是简短的 `//` 行内注释或逻辑块前注释。
- 未看到为显而易见语句做重复解释的注释风格。

**JSDoc/TSDoc:**
- Not detected。

**TODO Comments:**
- TODO/FIXME 约定：Not detected。

## Function Design

**Size:**
- 函数规模差异很大。
- 几何、碰撞、格式化等底层 helper 往往较短。
- 初始化、AI、战斗循环、相机效果、关卡构建等函数偏长，这是单文件架构下的当前写法。

**Parameters:**
- 参数数量通常直接按领域对象传递，没有统一包成 options object 的强约束。
- 在需要可选行为时，会使用对象参数并给默认值，例如 `cloneAsset(path, { ignorePlaceholders = false } = {})`。

**Return Values:**
- 常用早返回降低嵌套。
- 查询型函数返回对象、数组项或 `null`/`undefined`，例如命中检测和实体查找函数。
- 状态更新函数更常直接修改共享对象，而不是返回新状态。

## Module Design

**Exports:**
- 未检测到 `export`。
- 整个应用运行在一个 `<script type="module">` 内部，通过顶层常量、共享容器和命名函数组织逻辑。

**Barrel Files:**
- Not applicable。

**Current Structural Pattern:**
- 渲染、资源加载、输入、UI、AI、物理、特效和比赛状态都聚合在 `index.html` 中。
- 代码组织主要依赖“按功能段连续摆放函数”而不是文件边界。
- 当前约定更偏向单文件原型/垂直切片写法，而不是分层模块化写法。

---

*Convention analysis: 2026-03-09*
*Update when real code patterns change*
