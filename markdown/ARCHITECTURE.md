# RockWorld 当前软件框架说明

## 1. 项目定位

当前项目是一个基于 Next.js App Router 的前端应用，主要用于记录和管理“异色精灵抓取任务”。

它目前保留的一级导航为：

- 首页
- 历史
- 方案
- 我的

整体结构偏移动端单页应用风格，核心能力包括：

- 创建抓取任务
- 记录任务过程
- 查看历史任务
- 查看抓取方案
- 本地存储任务数据
- 使用精灵头像、方案卡片、弹窗交互完成记录流程

## 2. 一级导航结构

```text
+--------------------------------------------------+
| 首页 | 历史 | 方案 | 我的                         |
+--------------------------------------------------+
```

对应页面路径：

- `/` 首页
- `/history` 历史页
- `/pets` 方案页
- `/settings` 我的页

## 3. 页面结构总览

```text
src/app
├─ layout.tsx                # 全局布局
├─ page.tsx                  # 首页
├─ history/page.tsx          # 历史页
├─ pets/page.tsx             # 方案页
├─ settings/page.tsx         # 我的页
├─ tasks
│  ├─ new/page.tsx           # 新建任务页
│  ├─ catchall/page.tsx      # 兜底页/占位页
│  └─ [id]
│     ├─ page.tsx            # 任务详情页
│     └─ edit/page.tsx       # 编辑任务页
└─ spirits
   └─ [id]/page.tsx          # 精灵详情页（当前项目中已存在）
```

## 4. 当前页面职责

### 首页 `/`

首页是当前项目的主操作入口，主要负责：

- 展示进行中的任务
- 快速进入任务详情
- 选择抓取方案并创建任务
- 删除任务
- 设置当前任务

首页依赖的核心能力：

- 从方案预设中创建任务
- 从本地存储读取任务列表
- 统计污染数 / 原色数
- 展示异色完成状态

核心文件：

- `src/app/page.tsx`

### 历史页 `/history`

历史页用于查看已经存在的历史任务或已完成任务。

核心文件：

- `src/app/history/page.tsx`

### 方案页 `/pets`

当前方案页更接近“图鉴 / 方案索引”形式，主要能力包括：

- 展示精灵列表
- 点击精灵查看相关抓取方案
- 使用预设方案数据驱动展示

核心文件：

- `src/app/pets/page.tsx`

依赖数据：

- `src/data/planPresets.json`
- `src/data/petPresets.json`

### 我的页 `/settings`

用于展示设置、数据管理或用户侧辅助信息。

核心文件：

- `src/app/settings/page.tsx`

### 任务详情页 `/tasks/[id]`

用于进入单个任务后进行记录与查看详情。

核心文件：

- `src/app/tasks/[id]/page.tsx`
- `src/components/tasks/task-detail-client.tsx`

### 任务编辑页 `/tasks/[id]/edit`

用于编辑已有任务。

核心文件：

- `src/app/tasks/[id]/edit/page.tsx`

### 新建任务页 `/tasks/new`

用于创建新任务。

核心文件：

- `src/app/tasks/new/page.tsx`

### 精灵详情页 `/spirits/[id]`

这是一个二级页面，不属于底部一级导航。
当前代码结构中已经存在，用于承载单个精灵维度的信息展示或后续扩展。

核心文件：

- `src/app/spirits/[id]/page.tsx`

## 5. 组件结构

### UI 基础组件

位于：

```text
src/components/ui
```

包括但不限于：

- 底部导航
- 弹窗
- 按钮
- 卡片
- 通用容器

这些组件负责统一视觉风格和基础交互。

### 任务相关组件

位于：

```text
src/components/tasks
```

主要承载：

- 任务详情展示
- 记录操作
- 精灵图片显示
- 编辑任务
- 状态卡片
- 任务选择与弹窗逻辑

这是当前业务逻辑最集中的区域。

### 方案相关组件

位于：

```text
src/components/plans
```

当前主要文件：

- `plan-record-client.tsx`

用于方案记录、方案视图或方案交互的客户端逻辑承载。

## 6. 数据层结构

### 预设数据

项目当前有两类核心静态数据：

```text
src/data
├─ planPresets.json   # 抓取方案预设
└─ petPresets.json    # 精灵预设数据
```

职责如下：

- `planPresets.json`
  - 定义方案卡片内容
  - 定义方案名称、目标异色、果实配方等

- `petPresets.json`
  - 定义精灵数据
  - 提供名称、图片、展示信息等基础资料

## 7. 存储模型

当前项目本地存储主要由 `src/lib/storage.ts` 管理。

### 当前 AppStorage 结构

```ts
type AppStorage = {
  tasks: Task[];
  currentTaskId: string | null;
  theme?: string;
};
```

说明：

- `tasks`
  - 保存所有任务记录
- `currentTaskId`
  - 记录当前选中的任务
- `theme`
  - 预留主题字段

### 当前存储能力

- 读取本地存储
- 保存任务
- 删除任务
- 获取当前任务
- 设置当前任务
- 清空数据
- 导入 / 导出数据

## 8. 当前核心业务流

### 任务创建流程

```text
方案预设
   ↓
首页选择方案
   ↓
createTaskFromPlan()
   ↓
saveTask()
   ↓
写入 localStorage
   ↓
进入任务详情页
```

### 任务展示流程

```text
localStorage
   ↓
getTasks()
   ↓
首页读取任务列表
   ↓
展示进行中任务 / 已完成状态 / 统计信息
```

### 方案展示流程

```text
planPresets.json + petPresets.json
   ↓
方案页读取数据
   ↓
生成精灵卡片 / 方案弹窗 / 关联展示
```

## 9. 核心工具模块

```text
src/lib
├─ assets.ts         # 资源路径处理
├─ calculations.ts   # 统计计算逻辑
├─ storage.ts        # 本地存储
├─ task-factory.ts   # 从方案预设创建任务
└─ utils.ts          # 通用工具函数
```

职责说明：

- `assets.ts`
  - 处理图片、静态资源路径
- `calculations.ts`
  - 计算污染数、原色数、任务统计等
- `storage.ts`
  - 任务存储读写入口
- `task-factory.ts`
  - 根据方案预设生成任务对象
- `utils.ts`
  - 通用辅助方法

## 10. 静态资源结构

```text
public
├─ icons            # 图标资源
└─ pets             # 精灵头像/图片资源
```

这些资源主要用于：

- 首页头像展示
- 方案页精灵展示
- 任务详情中的精灵图片
- 底部导航图标

## 11. 当前架构 ASCII 图

```text
                     +----------------------+
                     |     Next.js App      |
                     |   App Router 架构     |
                     +----------+-----------+
                                |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
 +-------------+         +-------------+         +-------------+
 |    首页      |         |    历史      |         |    方案      |
 |    /         |         | /history    |         |   /pets      |
 +------+------+         +------+------+         +------+------+
        |                       |                       |
        |                       |                       |
        v                       v                       v
 +-------------+         +-------------+         +-------------+
 | 进行中任务卡片 |         | 历史任务列表  |         | 精灵 / 方案展示 |
 +------+------+         +-------------+         +------+------+
        |                                                     |
        v                                                     v
 +-------------------+                               +-------------------+
 | 任务详情 /tasks/id |                               | 方案预设 planPresets |
 +---------+---------+                               +-------------------+
          |
          v
 +-------------------+
 | localStorage 存储  |
 | tasks/currentTask |
 +-------------------+
```

## 12. 当前项目特点总结

### 优点

- 一级导航清晰
- 页面职责明确
- 本地存储结构简单，便于快速开发
- 方案数据和精灵数据已分离
- 已具备任务、方案、历史、设置四大主区块

### 当前现状

- 项目核心仍然围绕“任务记录”展开
- 方案页和首页都依赖预设数据驱动
- 存储模型目前仍以任务为中心
- 精灵详情页结构已存在，但能力还需要继续补强

### 后续适合继续迭代的方向

- 强化精灵维度汇总
- 强化多精灵记录模型
- 优化方案页图片化表达
- 完善任务详情中的细分记录区
- 清理部分文本编码异常问题

## 13. 当前核心文件索引

- `src/app/page.tsx`
- `src/app/history/page.tsx`
- `src/app/pets/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/tasks/[id]/page.tsx`
- `src/app/tasks/[id]/edit/page.tsx`
- `src/app/tasks/new/page.tsx`
- `src/app/spirits/[id]/page.tsx`
- `src/lib/storage.ts`
- `src/lib/task-factory.ts`
- `src/lib/calculations.ts`
- `src/data/planPresets.json`
- `src/data/petPresets.json`
