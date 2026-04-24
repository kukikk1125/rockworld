# 当前界面按钮与交互逻辑说明

## 文档目的

这份文档用于说明当前项目里“所有主要按钮与可点击交互”的实际行为，方便后续继续修改页面逻辑。

说明重点：

- 按钮或点击区域在哪里
- 点击后页面会发生什么变化
- 是否会跳转页面
- 是否会弹窗
- 是否会写入本地数据

## 一级导航

当前底部一级导航固定为：

- 首页 `/`
- 记录 `/history`
- 图鉴 `/pets`
- 我的 `/settings`

交互规则：

- 点击底部导航项后，直接切换到对应一级页面
- 当前页面对应的导航项会显示高亮状态
- 这些导航不依赖任务 id 或精灵 id，属于静态可部署页面

涉及文件：

- [bottom-nav.tsx](E:/rockworld/src/components/ui/bottom-nav.tsx)

---

## 首页 `/`

首页分成两个主要区域：

- 进行中的任务
- 抓取方案入口

涉及文件：

- [page.tsx](E:/rockworld/src/app/page.tsx)

### 1. 进行中任务卡片

点击区域：

- 整张任务卡片可点击

点击后效果：

- 调用 `setCurrentTask(task.id)`，把这条任务设为当前任务
- 跳转到任务记录页：
  - `/tasks/view?taskId=任务id`

页面变化：

- 页面从首页切到任务记录页
- 任务记录页会读取这个 `taskId` 并展示对应任务内容

### 2. 首页任务卡片里的“删除”

点击区域：

- 每张进行中任务卡右上角的删除按钮

点击后效果：

- 不直接删除
- 会先把当前任务写入 `deleteTarget`
- 打开确认弹窗

弹窗行为：

- 点击“取消”：关闭弹窗，不做任何改动
- 点击“删除”：执行 `deleteTask(deleteTarget.id)`

数据变化：

- 本地存储中的该任务被删除
- 与这个任务相关的异色存档记录也一起删除
- 首页任务列表刷新

### 3. 混抓方案卡片

点击区域：

- 每一张方案卡片整卡可点击

点击后效果：

- 如果这个方案已经存在任务记录：
  - 直接打开已有任务
- 如果这个方案还没有任务记录：
  - 创建新任务
  - 保存到本地存储
  - 再跳转到任务记录页

数据变化：

- 可能新增一个 `Task`
- 也可能只是切换到已有任务

### 4. 定向方案卡片

点击区域：

- 首页中的定向入口卡片

点击后效果：

- 不直接建任务
- 打开“选择定向精灵”的弹层

### 5. 定向精灵选择弹层

点击区域：

- 右上角“关闭”
- 弹层内每一个精灵头像按钮

点击“关闭”后效果：

- 关闭弹层
- 不创建任务

点击某个精灵后效果：

- 基于该精灵生成定向方案
- 如果已有同方案任务：
  - 关闭弹层
  - 打开已有任务
- 如果没有同方案任务：
  - 新建任务
  - 保存任务
  - 关闭弹层
  - 跳转到任务记录页

---

## 记录页 `/history`

记录页当前是双标签结构：

- 任务列表
- 已存档异色记录

涉及文件：

- [page.tsx](E:/rockworld/src/app/history/page.tsx)

### 1. 顶部标签切换

按钮：

- `任务列表`
- `已存档异色记录`

点击后效果：

- 切换本地状态 `tab`
- 页面内容在两个面板之间切换
- 不会跳转路由

### 2. 任务列表中的任务卡片

点击区域：

- 整张任务卡片可点击

点击后效果：

- 设置当前任务
- 跳转到：
  - `/tasks/view?taskId=任务id`

### 3. 任务列表中的“删除”

点击区域：

- 任务卡右上角删除按钮

点击后效果：

- 打开确认弹窗

弹窗行为：

- 点击“取消”：关闭
- 点击“删除”：删除该任务并刷新列表

数据变化：

- 任务删除
- 该任务关联的异色存档删除

### 4. 已存档异色记录卡片

点击区域：

- 若该记录 `clickable=true`，整张卡片可点击
- 若 `clickable=false`，卡片只展示信息，不可点开

点击后效果：

- 打开底部抽屉式详情弹层

### 5. 异色记录详情抽屉

按钮：

- `关闭`

点击后效果：

- 关闭当前抽屉
- 不修改数据

展示内容变化：

- 展示该次异色存档时的快照数据：
  - 当时污染数量
  - 当时原色数量

---

## 图鉴页 `/pets`

图鉴页主要是“精灵检索 + 精灵详情入口”。

涉及文件：

- [page.tsx](E:/rockworld/src/app/pets/page.tsx)

### 1. 搜索框

交互：

- 输入关键字后，立即更新本地状态 `keyword`

页面变化：

- 图鉴精灵列表实时过滤
- 过滤逻辑基于精灵名称包含关键字

### 2. 精灵卡片

点击区域：

- 每张精灵卡片整卡可点击

点击后效果：

- 跳转到精灵详情页：
  - `/spirits/view?spiritId=精灵id`

页面变化：

- 进入精灵详情页

显示逻辑补充：

- 如果该精灵已有异色存档：
  - 卡片显示已拥有状态
  - 右上角显示全局异色次数角标

---

## 我的页 `/settings`

我的页当前主要是只读型信息展示，没有复杂操作按钮。

涉及文件：

- [page.tsx](E:/rockworld/src/app/settings/page.tsx)

当前交互：

- 主要是浏览数据
- 最近获得异色区域目前没有跳转按钮
- 不会修改本地数据

---

## 任务记录页 `/tasks/view?taskId=...`

这是当前最核心的操作页。

涉及文件：

- [page.tsx](E:/rockworld/src/app/tasks/view/page.tsx)
- [plan-record-client.tsx](E:/rockworld/src/components/plans/plan-record-client.tsx)
- [spirit-picker-dialog.tsx](E:/rockworld/src/components/tasks/spirit-picker-dialog.tsx)

页面由两部分组成：

- 顶部任务摘要
- 下方精灵记录卡片区

### 1. 页面初始化逻辑

进入页面时：

- 从 URL 读取 `taskId`
- 调用 `getTaskById(taskId)`
- 读到任务后：
  - 加载任务
  - 加载全局精灵库
  - 设置当前任务

如果没读到任务：

- 页面只显示“未找到对应任务”

### 2. “补记方案外异色”

按钮位置：

- 任务摘要卡右侧

点击后效果：

- 打开精灵选择弹窗 `SpiritPickerDialog`

### 3. 补记异色弹窗

弹窗内交互：

- 顶部关闭按钮
- 搜索输入框
- 精灵头像列表
- 可选的新建精灵按钮

#### 3.1 点击关闭

效果：

- 关闭弹窗
- 不改数据

#### 3.2 输入搜索关键字

效果：

- 实时过滤精灵列表

#### 3.3 点击现有精灵

效果：

- 记录一条“方案外异色存档”
- 存档类型为 `unexpected`
- 不会把这只精灵加入当前任务卡片列表
- 当前任务只会刷新 `hasStarted / updatedAt`
- 关闭弹窗
- 页面底部弹一个 toast 提示

页面变化：

- 任务卡片区不会新增卡片
- 历史存档里会新增一条记录

#### 3.4 点击“新增精灵”

触发条件：

- 输入框内容非空
- 当前精灵库里没有同名精灵
- `allowCreate=true`

效果：

- 先把新精灵写入全局精灵库
- 再按“方案外异色”方式立即存档
- 关闭弹窗
- 页面底部弹 toast

数据变化：

- 新增 `Spirit`
- 新增一条 `ShinyArchiveRecord`

### 4. 精灵记录卡片

每张卡代表当前任务中的一个目标精灵。

卡片内主要按钮：

- `污染 +1`
- `原色 +1`
- `异色 +1`
- `撤销上一步`

#### 4.1 点击“污染 +1”

效果：

- 当前卡片 `pollutionCount +1`
- 记录 `lastAction=污染`
- 任务 `updatedAt` 更新
- 页面立即刷新当前卡片显示

页面变化：

- 保底进度条增加
- 污染统计数字增加

#### 4.2 点击“原色 +1”

效果：

- 当前卡片 `normalCount +1`
- 记录 `lastAction=原色`
- 任务更新时间更新

页面变化：

- 保底进度条增加
- 原色统计数字增加

#### 4.3 点击“异色 +1”

效果：

- 将当前卡片视为“方案内异色命中”
- 生成一条 `target` 类型存档记录
- 存入 `shinyArchiveRecords`
- 当前卡片的：
  - `pollutionCount` 清零
  - `normalCount` 清零
  - `currentShinyCount` 置回 0
- `lastAction` 记录为一次可撤销的异色操作
- 页面底部弹 toast

页面变化：

- 当前卡片不会消失
- 当前卡片会自动进入下一轮记录
- 全局异色次数角标增加
- 历史页的异色存档列表新增一条记录

这也是当前“异色后自动存档并继续下一轮”的核心逻辑。

#### 4.4 点击“撤销上一步”

可点击条件：

- 当前卡片存在 `lastAction`

效果：

- 回滚当前卡片最近一次操作
- 如果最近一次是异色存档：
  - 同时删除对应的存档记录

页面变化：

- 污染 / 原色 / 异色状态恢复到上一步之前
- 如为异色撤销，则历史存档中对应记录消失
- 页面底部弹 toast

### 5. toast 提示

任务记录页目前会在以下操作后弹出底部短提示：

- 方案内异色存档成功
- 方案外异色存档成功
- 撤销成功

特点：

- 自动显示
- 约 2.2 秒后自动消失
- 不阻塞后续操作

---

## 精灵详情页 `/spirits/view?spiritId=...`

这是精灵维度的总览页。

涉及文件：

- [page.tsx](E:/rockworld/src/app/spirits/view/page.tsx)
- [spirit-detail-client.tsx](E:/rockworld/src/components/tasks/spirit-detail-client.tsx)
- [task-select-dialog.tsx](E:/rockworld/src/components/tasks/task-select-dialog.tsx)

主要结构：

- 顶部精灵总览卡
- 快捷记录按钮
- 按任务来源拆分统计
- 可用抓取方案列表

### 1. 快捷记录按钮

按钮：

- `污染 +1`
- `原色 +1`
- `异色 +1`

#### 1.1 点击时的分流逻辑

系统先检查当前“进行中的任务”数量：

- 如果为 0：
  - 不执行记录
  - 弹出提示弹窗，提示先创建任务
- 如果为 1：
  - 直接把本次操作记到这个唯一任务里
- 如果大于 1：
  - 打开任务选择弹窗
  - 让用户选择归属任务

#### 1.2 只有一个任务时

效果：

- 直接对该任务执行记录
- 污染 / 原色逻辑与任务记录页一致
- 异色逻辑也会直接生成存档
- 页面汇总数据刷新

#### 1.3 多任务时打开任务选择弹窗

弹窗内按钮：

- 右上角关闭
- 每个任务一张可点击卡

点击关闭：

- 关闭弹窗
- 本次快捷记录取消

点击某个任务：

- 将当前快捷动作绑定到所选任务
- 执行写入
- 关闭弹窗
- 精灵详情刷新

### 2. 抓取方案里的“重新记录”

按钮位置：

- 每张候选方案卡底部

点击后效果：

- 如果该方案已存在任务：
  - 直接跳转到已有任务记录页
- 如果该方案不存在任务：
  - 新建任务
  - 保存任务
  - 设为当前任务
  - 跳转到任务记录页

跳转地址：

- `/tasks/view?taskId=...`

### 3. 没有进行中任务时的提示弹窗

弹窗组件：

- `ConfirmDialog`

触发方式：

- 在精灵详情页点击快捷记录按钮，但当前没有任何进行中任务

点击确认按钮后效果：

- 关闭提示弹窗
- 不修改数据

---

## 通用弹窗组件

涉及文件：

- [confirm-dialog.tsx](E:/rockworld/src/components/ui/confirm-dialog.tsx)

当前用于：

- 删除任务确认
- 无任务时的提示
- 其他单确认或确认/取消结构的操作

通用行为：

- `open=false` 时完全不渲染
- 支持：
  - 确认按钮
  - 取消按钮
  - 隐藏取消按钮
  - 不同按钮样式

---

## 当前交互逻辑中的关键状态变化

后续如果你要继续改页面逻辑，最值得优先关注的是下面几组状态：

### 1. 当前任务切换

发生位置：

- 首页点击任务
- 记录页点击任务
- 精灵详情页重新记录

核心行为：

- `setCurrentTask(task.id)`
- 跳转到任务记录页

### 2. 异色记录的双路径

当前有两种异色记录方式：

- 方案内异色
  - 来自任务卡片上的 `异色 +1`
  - 会生成存档
  - 会清空当前卡片计数并进入下一轮
- 方案外异色
  - 来自“补记方案外异色”
  - 会生成存档
  - 但不会进入当前任务卡片列表

### 3. 撤销逻辑

当前撤销只针对“单个精灵卡片的最近一步”。

如果最近一步是：

- 污染：恢复污染数量
- 原色：恢复原色数量
- 异色：恢复卡片数据，并删除对应存档

### 4. GitHub Pages 路由限制

当前线上部署不能直接使用这种运行时动态路径：

- `/tasks/任务id`
- `/spirits/精灵id`

所以现在已经统一改成静态页 + 查询参数：

- `/tasks/view?taskId=...`
- `/spirits/view?spiritId=...`

以后如果继续改按钮跳转逻辑，这一点一定要保留。

---

## 建议你下一步优先梳理的逻辑点

如果你准备继续修改交互，建议优先考虑这几类：

1. 任务记录页的“异色 +1”是否还要继续保留“自动清零进入下一轮”
2. 方案外异色是否应该出现在当前任务页可见区域
3. 精灵详情页的快捷记录是否要增加二次确认
4. 删除任务时是否要保留历史异色存档
5. 图鉴卡点击后是否要先弹中间态面板，而不是直接跳详情

---

## 相关核心文件索引

- [src/app/page.tsx](E:/rockworld/src/app/page.tsx)
- [src/app/history/page.tsx](E:/rockworld/src/app/history/page.tsx)
- [src/app/pets/page.tsx](E:/rockworld/src/app/pets/page.tsx)
- [src/app/settings/page.tsx](E:/rockworld/src/app/settings/page.tsx)
- [src/components/plans/plan-record-client.tsx](E:/rockworld/src/components/plans/plan-record-client.tsx)
- [src/components/tasks/spirit-detail-client.tsx](E:/rockworld/src/components/tasks/spirit-detail-client.tsx)
- [src/components/tasks/spirit-picker-dialog.tsx](E:/rockworld/src/components/tasks/spirit-picker-dialog.tsx)
- [src/components/tasks/task-select-dialog.tsx](E:/rockworld/src/components/tasks/task-select-dialog.tsx)
- [src/components/ui/bottom-nav.tsx](E:/rockworld/src/components/ui/bottom-nav.tsx)
- [src/components/ui/confirm-dialog.tsx](E:/rockworld/src/components/ui/confirm-dialog.tsx)
