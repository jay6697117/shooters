# 第一人称视角（FPS）模式设计

> 日期：2026-03-10
> 状态：已批准
> 方案：A — 单相机模式切换

## 概述

为"卡通大乱斗"添加可切换的第一人称视角模式。保留一个 `PerspectiveCamera`，在俯视（top-down）和 FPS 两种位置/朝向之间切换。

## 核心决策

| 决策点 | 结论 |
|--------|------|
| 相机数量 | 1 个，模式切换位置/朝向 |
| 视角关系 | 可切换共存，按 F5 或 C 键 |
| 武器展示 | FPS 下显示武器 viewmodel |
| 输入控制 | FPS 用 Pointer Lock + mousemove |
| 移动 | 自动兼容（已基于 camera direction） |

## 技术要点

### 1. 状态管理
- 新增 `state.viewMode = 'topdown' | 'fps'`
- 切换时更新相机位置/朝向、输入模式、模型可见性

### 2. 相机控制
- **俯视**：维持现有 `CONFIG.camera.position/lookAt`
- **FPS**：`camera.position = player.position + (0, eyeHeight, 0)`，朝向跟随 `player.yaw` + pitch

### 3. Pointer Lock
- FPS 模式进入时 `canvas.requestPointerLock()`
- `movementX` → yaw，`movementY` → pitch（clamp ±80°）
- Esc 退出时自动恢复俯视模式

### 4. 瞄准适配
- 俯视：`raycaster` → 地面平面（不变）
- FPS：屏幕中心 ray → 沿相机方向 × 射程

### 5. 模型可见性
- FPS 下 `player.root.visible = false`
- 武器 mesh clone → 挂到 camera 子节点作为 viewmodel

### 6. 特殊镜头
- kill cam / near miss drama → 临时切回俯视相机逻辑
- 切换完成后恢复 FPS 模式
