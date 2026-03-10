# FPS 视角模式实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为卡通大乱斗添加可切换的第一人称视角（FPS）模式，按 F5 键在俯视和 FPS 之间切换。

**Architecture:** 复用现有单个 `PerspectiveCamera`，通过 `state.viewMode` 控制相机位置/朝向的计算逻辑。FPS 模式使用 Pointer Lock API 获取鼠标增量来驱动 yaw/pitch。瞄准系统在 FPS 模式下改为屏幕中心 ray。

**Tech Stack:** Three.js、Pointer Lock API、现有 index.html 内联 JS

---

### Task 1: 添加 FPS 状态和配置

**Files:**
- Modify: `index.html:1416-1422` (CONFIG.camera 区块)
- Modify: `index.html` (state 对象附近)

**Step 1: 在 CONFIG.camera 中添加 FPS 配置**

在 `CONFIG.camera` 中追加 FPS 专用参数：

```javascript
camera: {
  fov: 50,
  near: 0.1,
  far: 200,
  position: new THREE.Vector3(0, 22, 18),
  lookAt: new THREE.Vector3(0, 0, 0),
  // FPS 模式配置
  fps: {
    fov: 75,
    eyeHeight: 1.6,        // 眼睛高度
    pitchMin: -1.2,         // 约 -70°
    pitchMax: 1.2,          // 约 +70°
    sensitivity: 0.003      // 鼠标灵敏度
  }
},
```

**Step 2: 在 state 对象中添加 viewMode**

找到 `state` 对象的定义处，添加：

```javascript
viewMode: 'topdown',  // 'topdown' | 'fps'
fpsPitch: 0,          // FPS 模式的俯仰角
```

**Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 添加 FPS 视角模式的配置和状态字段"
```

---

### Task 2: 实现 Pointer Lock 绑定和视角切换键

**Files:**
- Modify: `index.html:1914-1971` (bindInput 函数)

**Step 1: 在 bindInput() 中添加 F5 切换和 Pointer Lock 监听**

在 `bindInput()` 函数的 keydown 处理中，`KeyV` 处理后添加 F5 切换逻辑：

```javascript
if (event.code === 'F5') {
  event.preventDefault();
  toggleViewMode();
}
```

在 `bindInput()` 末尾、`}` 闭合之前，添加 Pointer Lock 事件：

```javascript
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== canvas && state.viewMode === 'fps') {
    // 用户按 Esc 退出了 Pointer Lock，自动切回俯视
    setViewMode('topdown');
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (state.viewMode !== 'fps' || document.pointerLockElement !== canvas) return;
  const sensitivity = CONFIG.camera.fps.sensitivity;
  const player = getPlayer();
  if (!player) return;
  // 水平鼠标增量 → yaw（左右看）
  player.yaw -= event.movementX * sensitivity;
  // 垂直鼠标增量 → pitch（上下看）
  state.fpsPitch -= event.movementY * sensitivity;
  state.fpsPitch = THREE.MathUtils.clamp(
    state.fpsPitch,
    CONFIG.camera.fps.pitchMin,
    CONFIG.camera.fps.pitchMax
  );
});
```

**Step 2: 添加 toggleViewMode() 和 setViewMode() 函数**

在 `bindInput()` 函数之前添加：

```javascript
function toggleViewMode() {
  setViewMode(state.viewMode === 'topdown' ? 'fps' : 'topdown');
}

function setViewMode(mode) {
  if (state.viewMode === mode) return;
  state.viewMode = mode;
  const player = getPlayer();

  if (mode === 'fps') {
    // 进入 FPS：锁定鼠标、隐藏玩家模型、隐藏准星
    canvas.requestPointerLock();
    if (player && player.root) player.root.visible = false;
    if (world.reticle) world.reticle.visible = false;
    state.fpsPitch = 0;
  } else {
    // 回到俯视：解锁鼠标、显示玩家模型、显示准星
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
    if (player && player.root) player.root.visible = true;
    if (world.reticle) world.reticle.visible = true;
    // 恢复相机到默认俯视位置
    world.camera.fov = CONFIG.camera.fov;
    world.camera.updateProjectionMatrix();
  }
}
```

**Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 添加 F5 视角切换和 Pointer Lock 事件绑定"
```

---

### Task 3: 修改 updateCameraFx() 支持 FPS 相机逻辑

**Files:**
- Modify: `index.html:6594-6680` (updateCameraFx 函数)

**Step 1: 在 updateCameraFx() 开头添加 FPS 分支**

在 `if (state.mode === 'killCam') return;` 之后，立即添加 FPS 模式的相机更新逻辑：

```javascript
// FPS 模式：相机跟随玩家
if (state.viewMode === 'fps') {
  const player = getPlayer();
  if (!player) return;

  const eyeHeight = CONFIG.camera.fps.eyeHeight;
  const yaw = player.yaw;
  const pitch = state.fpsPitch;

  // 相机位置 = 玩家位置 + 眼高
  world.camera.position.set(
    player.position.x,
    eyeHeight,
    player.position.z
  );

  // 根据 yaw + pitch 计算看向的点
  const lookDir = new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch)
  );
  const lookTarget = world.camera.position.clone().add(lookDir);
  world.camera.lookAt(lookTarget);

  // FPS 使用专属 FOV
  world.camera.fov = CONFIG.camera.fps.fov + fx.fovPulse * 2;
  world.camera.updateProjectionMatrix();

  // 应用枪械抖动（缩小系数避免在 FPS 下过度晃动）
  if (fx.shakeTime > 0) {
    const shake = fx.shakeIntensity * 0.4;
    world.camera.position.x += (Math.random() - 0.5) * shake;
    world.camera.position.y += (Math.random() - 0.5) * shake * 0.5;
    world.camera.position.z += (Math.random() - 0.5) * shake;
    fx.shakeTime -= dt;
  }

  // 衰减 pulse
  fx.fovPulse = moveToward(fx.fovPulse, 0, dt * 5);
  fx.shotRecoilPulse = moveToward(fx.shotRecoilPulse, 0, dt * 4.5);
  fx.lowHpPulse = moveToward(fx.lowHpPulse, 0, dt * 2.2);
  return; // FPS 模式到此结束，不走俯视逻辑
}
```

**Step 2: 提交**

```bash
git add index.html
git commit -m "feat: updateCameraFx 添加 FPS 相机跟随逻辑"
```

---

### Task 4: 修改瞄准系统适配 FPS 模式

**Files:**
- Modify: `index.html:5142-5150` (getAimPoint 函数)
- Modify: `index.html:5125-5140` (updateAim 函数)

**Step 1: 修改 getAimPoint() 添加 FPS 分支**

```javascript
function getAimPoint() {
  if (state.viewMode === 'fps') {
    // FPS 模式：沿相机正前方方向取远点作为瞄准点
    const dir = new THREE.Vector3();
    world.camera.getWorldDirection(dir);
    const origin = world.camera.position.clone();
    const aimPoint = origin.addScaledVector(dir, 50); // 足够远
    aimPoint.y = 0; // 投影到地面
    return aimPoint;
  }
  // 俯视模式：保持原有 raycaster 逻辑
  raycaster.setFromCamera({ x: input.mouse.x, y: input.mouse.y }, world.camera);
  const point = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(groundPlane, point);
  if (!hit) return null;
  point.x = THREE.MathUtils.clamp(point.x, CONFIG.arena.bounds.minX, CONFIG.arena.bounds.maxX);
  point.z = THREE.MathUtils.clamp(point.z, CONFIG.arena.bounds.minZ, CONFIG.arena.bounds.maxZ);
  return point;
}
```

**Step 2: 修改 updateAim() 在 FPS 下使用鼠标直接控制的 yaw**

在 `updateAim()` 顶部添加：

```javascript
function updateAim(entity, targetPos, dt) {
  if (state.viewMode === 'fps' && entity.isPlayer) {
    // FPS 下玩家 yaw 由鼠标直接控制，不走 rotateToward
    entity.group.rotation.y = entity.yaw + MODEL_YAW_OFFSET;
    // 隐藏地面准星
    return;
  }
  // ... 原有逻辑不变
```

**Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 瞄准系统适配 FPS 模式"
```

---

### Task 5: 添加 FPS 模式十字准星 HUD

**Files:**
- Modify: `index.html` (HTML 部分和 CSS 部分)

**Step 1: 在 HTML 中添加 FPS 十字准星元素**

在 `#canvasWrap` 内、其他 overlay 元素附近添加：

```html
<div id="fpsCrosshair">
  <div class="ch-line ch-top"></div>
  <div class="ch-line ch-bottom"></div>
  <div class="ch-line ch-left"></div>
  <div class="ch-line ch-right"></div>
  <div class="ch-dot"></div>
</div>
```

**Step 2: 添加 CSS 样式**

```css
#fpsCrosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: none; /* 默认隐藏 */
  z-index: 20;
}

#fpsCrosshair .ch-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.85);
}

#fpsCrosshair .ch-top { width: 2px; height: 12px; left: -1px; bottom: 6px; }
#fpsCrosshair .ch-bottom { width: 2px; height: 12px; left: -1px; top: 6px; }
#fpsCrosshair .ch-left { width: 12px; height: 2px; top: -1px; right: 6px; }
#fpsCrosshair .ch-right { width: 12px; height: 2px; top: -1px; left: 6px; }

#fpsCrosshair .ch-dot {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  top: -1.5px;
  left: -1.5px;
}
```

**Step 3: 在 setViewMode() 中切换十字准星显示**

```javascript
const crosshair = document.getElementById('fpsCrosshair');
if (mode === 'fps') {
  if (crosshair) crosshair.style.display = 'block';
} else {
  if (crosshair) crosshair.style.display = 'none';
}
```

**Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 添加 FPS 模式十字准星 HUD"
```

---

### Task 6: 处理边界情况

**Files:**
- Modify: `index.html` (多处)

**Step 1: 菜单/match over 时强制回俯视**

在 `startMatch()`、`setMode('menu')` 或 `setMode('matchOver')` 附近添加：

```javascript
if (state.viewMode === 'fps') setViewMode('topdown');
```

**Step 2: kill cam 期间临时切回俯视视角**

在 kill cam 开始处，保存当前 viewMode，临时切回 topdown，kill cam 结束后恢复：

```javascript
// kill cam 开始
state.viewModeBeforeKillCam = state.viewMode;
if (state.viewMode === 'fps') setViewMode('topdown');

// kill cam 结束
if (state.viewModeBeforeKillCam === 'fps') setViewMode('fps');
```

**Step 3: FPS 模式下阻止 pointermove 更新 input.mouse**

在 `updatePointer()` 顶部添加：

```javascript
function updatePointer(event) {
  if (state.viewMode === 'fps') return; // FPS 下不走 raycaster 定位
  // ... 原逻辑
}
```

**Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 处理 FPS 视角的边界情况"
```

---

## 验证计划

### 浏览器手动验证

按以下步骤在浏览器中测试：

1. **启动游戏**：`npx serve .` 然后打开 `http://localhost:3000`
2. **进入对战**：选择 duel 模式，按 Enter 开始
3. **切换到 FPS**：按 F5 键
   - ✅ 相机应该跳到玩家眼睛高度
   - ✅ 鼠标应该被锁定（cursor 消失）
   - ✅ 移动鼠标应该能环顾四周
   - ✅ WASD 移动应该基于你面朝的方向
   - ✅ 屏幕中心应该显示十字准星
   - ✅ 看不到自己的角色模型
   - ✅ 能看到对手和场景物体
4. **射击**：鼠标左键射击
   - ✅ 子弹应该朝屏幕中心方向射出
5. **切换回俯视**：按 F5
   - ✅ 相机恢复到高空俯视
   - ✅ 鼠标解锁恢复正常
   - ✅ 玩家模型重新显示
   - ✅ 地面准星恢复
6. **Esc 退出**：在 FPS 模式下按 Esc
   - ✅ 应自动切回俯视模式
7. **Kill cam**：在 FPS 模式下触发 kill cam（击杀对手或被击杀）
   - ✅ kill cam 应正常播放
   - ✅ kill cam 结束后应恢复 FPS 模式

### 静态代码检查

```bash
# 确认没有 JS 语法错误
node -e "const fs = require('fs'); const html = fs.readFileSync('index.html', 'utf8'); const m = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g); console.log('script blocks found:', m.length);"
```

### 控制台错误检查

在浏览器 DevTools 控制台中：
- 切换视角前后不应有报错
- 射击、移动、死亡过程中不应有报错
