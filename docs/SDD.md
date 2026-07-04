# TaskFlow v1.0 — 移动端任务管理系统 SDD

> **版本**: v1.0  
> **定位**: 面向手机日常用户的轻量级任务管理 Progressive Web App  
> **目标平台**: iOS Safari / Android Chrome / 桌面浏览器（渐进增强）  
> **技术栈**: Next.js 16 + TypeScript 5 + Tailwind CSS 4 + Supabase PostgreSQL

---

## 目录

1. [系统模块组成](#1-系统模块组成)
2. [模块职责定义](#2-模块职责定义)
3. [核心流程](#3-核心流程)
4. [数据存储](#4-数据存储)
5. [接口定义](#5-接口定义)
6. [状态流转](#6-状态流转)
7. [异常处理](#7-异常处理)
8. [安全、性能、可维护性](#8-安全性能可维护性)

---

## 1. 系统模块组成

```
TaskFlow v1.0
├── 1. 认证模块 (Auth Module)
│   ├── 1.1 邮箱注册/登录
│   ├── 1.2 Supabase OAuth（后续）
│   └── 1.3 演示模式（离线可用）
│
├── 2. 任务核心模块 (Task Core Module)
│   ├── 2.1 任务 CRUD
│   ├── 2.2 状态流转引擎
│   ├── 2.3 优先级系统
│   └── 2.4 截止日期追踪
│
├── 3. 列表与视图模块 (View Module)
│   ├── 3.1 任务列表（默认视图）
│   ├── 3.2 今日视图（Today View）
│   ├── 3.3 看板视图（Kanban）
│   └── 3.4 日历视图（Calendar）
│
├── 4. 筛选与排序模块 (Filter & Sort Module)
│   ├── 4.1 状态筛选
│   ├── 4.2 优先级筛选
│   ├── 4.3 关键词搜索
│   └── 4.4 多维排序
│
├── 5. 统计模块 (Stats Module)
│   ├── 5.1 任务概览卡片
│   ├── 5.2 完成率趋势
│   └── 5.3 逾期预警
│
├── 6. 通知模块 (Notification Module)
│   ├── 6.1 截止日期提醒（Push / Web Notification）
│   ├── 6.2 每日任务概览
│   └── 6.3 逾期告警
│
├── 7. PWA 模块 (PWA Module)
│   ├── 7.1 Service Worker 离线缓存
│   ├── 7.2 添加到主屏幕
│   ├── 7.3 离线演示模式
│   └── 7.4 后台同步
│
├── 8. 触控交互模块 (Touch Module)
│   ├── 8.1 滑动操作（左滑完成/右滑删除）
│   ├── 8.2 下拉刷新
│   ├── 8.3 长按拖拽排序
│   └── 8.4 底部弹出表单（BottomSheet）
│
├── 9. 数据导出模块 (Export Module)
│   ├── 9.1 CSV 导出
│   ├── 9.2 JSON 导出
│   └── 9.3 剪贴板分享
│
└── 10. 基础设施模块 (Infra Module)
    ├── 10.1 Supabase 客户端
    ├── 10.2 本地存储适配器
    ├── 10.3 日期工具库
    └── 10.4 离线同步队列
```

---

## 2. 模块职责定义

### 2.1 认证模块

| 职责 | 说明 |
|------|------|
| 用户身份管理 | 注册、登录、登出、会话持久化 |
| 双模式切换 | 自动检测 Supabase 配置，无配置时降级为本地演示模式 |
| 路由守卫 | 未认证用户访问 `/dashboard` → 重定向至 `/login` |
| 会话恢复 | 页面刷新后从 Supabase session 或 localStorage 恢复登录态 |
| 错误反馈 | 密码不匹配、邮箱已注册、网络错误等统一提示 |

### 2.2 任务核心模块

| 职责 | 说明 |
|------|------|
| 创建任务 | 必填 title，可选 description/priority/due_date/tag |
| 编辑任务 | 全字段可修改，表单预填现有值 |
| 删除任务 | 确认对话框，一次性删除（不可恢复，可扩展软删除） |
| 状态变更 | 单向流转：todo → doing → done，也可直接跳转 |
| 数据验证 | 前端验证 title 非空，后端 RLS 验证 user_id 归属 |

### 2.3 列表与视图模块

| 视图 | 职责 | 优先级 |
|------|------|--------|
| 任务列表 | 默认卡片列表，支持筛选排序 | P0 |
| 今日视图 | 仅展示今天到期 + 逾期未完成的任务 | P1 |
| 看板视图 | 三列拖拽（todo / doing / done），可视化状态流转 | P2 |
| 日历视图 | 按月/周展示任务分布，快速跳转日期 | P3 |

### 2.4 PWA 模块

| 职责 | 说明 |
|------|------|
| Service Worker | 缓存静态资源（JS/CSS/字体），离线访问 |
| Web App Manifest | 定义应用名、图标、启动方式、主题色 |
| 离线演示模式 | 无网络时自动切换本地存储，恢复正常后同步 |
| 安装提示 | 浏览器原生 beforeinstallprompt 事件处理 |
| 后台同步 | SyncManager API：离线创建的任务在网络恢复后上传 |

### 2.5 触控交互模块

| 手势 | 触发条件 | 行为 |
|------|----------|------|
| 左滑 (swipe left) | 滑动距离 > 60px | 完成任务（todo→doing / doing→done） |
| 右滑 (swipe right) | 滑动距离 > 60px | 删除任务（弹出确认） |
| 下拉 (pull down) | 列表顶部下拉 > 80px | 刷新任务列表 |
| 长按 (long press) | 按住 > 500ms | 进入拖拽排序模式 |
| 点击加号 (FAB) | 悬浮按钮点击 | 弹出 BottomSheet 快速创建表单 |

---

## 3. 核心流程

### 3.1 用户首次使用流程

```
用户打开 URL
  │
  ├─ 已登录（session 有效）
  │   └─ → /dashboard（加载已有任务）
  │
  └─ 未登录
      └─ → /（首页）
          ├─ 点击「注册」
          │   ├─ 输入邮箱 + 密码 + 确认密码
          │   ├─ 客户端校验（密码 ≥ 6 位，两次一致）
          │   ├─ 调用 signUp() API
          │   ├─ 成功 → 自动登录 → /dashboard
          │   └─ 失败 → 显示错误（红色提示条）
          │
          └─ 点击「登录」
              ├─ 输入邮箱 + 密码
              ├─ 调用 signIn() API
              ├─ 成功 → /dashboard
              └─ 失败 → 显示错误
```

### 3.2 任务生命周期流程

```
创建任务
  │  title 必填，其余可选
  │  默认 status=todo, priority=medium
  ▼
┌──────────────────────────────────────────┐
│  todo（待办）                              │
│   显示: 琥珀色标签 + 正常优先级颜色         │
│   操作: 可编辑、删除、推进到 doing           │
└────────────┬─────────────────────────────┘
             │ 点击 → / 左滑
             ▼
┌──────────────────────────────────────────┐
│  doing（进行中）                           │
│   显示: 蓝色标签 + 正常优先级颜色           │
│   操作: 可编辑、删除、推进到 done / 退回 todo│
└────────────┬─────────────────────────────┘
             │ 点击 → / 左滑
             ▼
┌──────────────────────────────────────────┐
│  done（已完成）                            │
│   显示: 绿色标签 + 标题删除线               │
│   操作: 可编辑、删除、重新激活到 todo       │
└──────────────────────────────────────────┘
```

### 3.3 离线使用流程

```
应用启动
  │
  ├─ 在线
  │   ├─ 加载 Supabase 数据
  │   ├─ 同步 localStorage 缓存
  │   └─ 注册 Service Worker（预缓存静态资源）
  │
  └─ 离线
      ├─ Service Worker 返回缓存页面
      ├─ 读取 localStorage 任务数据
      ├─ 用户操作存入 localStorage + 离线队列
      └─ 网络恢复后：
          ├─ 重放离线队列中的操作
          ├─ 冲突检测（时间戳比较 / 服务端优先）
          └─ 合并数据 → 更新 UI
```

### 3.4 通知推送流程

```
任务创建时设置 due_date
  │
  ▼
截止日期前 1 天 09:00
  │  Service Worker 定时检查
  │  （或 Supabase Edge Function 定时触发）
  ▼
发送 Web Push Notification
  │  标题: "⏰ 任务明天截止"
  │  内容: task.title + due_date
  │
  ▼
用户点击通知
  └─ → 打开 App → /dashboard → 定位到该任务
```

---

## 4. 数据存储

### 4.1 生产数据库（Supabase PostgreSQL）

```sql
-- ===== 用户表（Supabase Auth 内置，不额外创建） =====
-- auth.users: id, email, encrypted_password, created_at, ...

-- ===== 任务表 =====
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo'
              CHECK (status IN ('todo', 'doing', 'done')),
  priority    TEXT NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high')),
  due_date    DATE,
  tag         TEXT,
  is_pinned   BOOLEAN DEFAULT false,         -- v1.0 新增：置顶
  order_index INTEGER DEFAULT 0,             -- v1.0 新增：拖拽排序
  remind_at   TIMESTAMPTZ,                   -- v1.0 新增：提醒时间
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()      -- v1.0 新增：更新时间
);

-- ===== 索引 =====
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_order ON tasks(user_id, order_index);

-- ===== 行级安全 =====
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);

-- ===== 自动更新 updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 本地存储（离线/演示模式）

```
localStorage
├── taskflow_user
│     { id: string, email: string }
│
├── taskflow_tasks
│     Task[]  // 同 tasks 表结构
│
└── taskflow_offline_queue        // v1.0 新增
      Array<{
        id: string                // 操作 UUID
        type: 'create' | 'update' | 'delete' | 'statusChange'
        payload: any
        timestamp: number
        synced: boolean
      }>
```

### 4.3 缓存策略（Service Worker）

```
Cache Storage
├── static-v1（预缓存，版本号管理）
│     /, /login, /register, /dashboard（HTML shell）
│     /_next/static/**（JS/CSS chunks）
│     /manifest.json, /icons/*（PWA 资源）
│
└── dynamic-v1（运行时缓存，LRU 淘汰）
      来自 Supabase 的 GET 响应（短时缓存 30s）
      来自 CDN 的第三方资源
```

### 4.4 数据关系图

```
┌──────────────┐
│  auth.users  │  (Supabase 托管)
│  ─────────── │
│  id (PK)     │
│  email       │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐
│    tasks     │
│  ─────────── │
│  id (PK)     │
│  user_id (FK)│──── 外键关联 auth.users.id
│  title       │
│  description │
│  status      │──── CHECK: todo | doing | done
│  priority    │──── CHECK: low | medium | high
│  due_date    │
│  tag         │
│  is_pinned   │──── v1.0 新增
│  order_index │──── v1.0 新增
│  remind_at   │──── v1.0 新增
│  created_at  │
│  updated_at  │──── v1.0 新增，触发器自动更新
└──────────────┘
```

---

## 5. 接口定义

### 5.1 TypeScript 核心类型

```typescript
// ===== app/types/task.ts =====

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tag: string | null;
  is_pinned: boolean;         // v1.0 新增
  order_index: number;        // v1.0 新增
  remind_at: string | null;   // v1.0 新增
  created_at: string;
  updated_at: string;         // v1.0 新增
};

// ===== 筛选与排序 =====

export type TaskFilterState = {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  search: string;
  view: 'all' | 'today';     // v1.0 新增
};

export type TaskSortType =
  | 'created-desc'
  | 'created-asc'
  | 'priority'
  | 'status'
  | 'status-priority'
  | 'due-date'
  | 'custom';                 // v1.0 新增：拖拽自定义顺序

// ===== 离线队列 =====

export type OfflineAction = {
  id: string;
  type: 'create' | 'update' | 'delete' | 'statusChange';
  taskId?: string;
  payload: Partial<Task>;
  timestamp: number;
  synced: boolean;
};

// ===== 统计 =====

export type TaskStats = {
  total: number;
  todo: number;
  doing: number;
  done: number;
  overdue: number;
  pinned: number;             // v1.0 新增
  completionRate: number;     // 0-100
  todayCount: number;         // v1.0 新增
};
```

### 5.2 服务层接口

```typescript
// ===== app/lib/task-service.ts =====

export interface ITaskService {
  fetchTasks(userId: string): Promise<Task[]>;
  createTask(userId: string, data: CreateTaskInput): Promise<Task>;
  editTask(taskId: string, updates: UpdateTaskInput): Promise<void>;
  removeTask(taskId: string): Promise<void>;
  changeTaskStatus(taskId: string, status: TaskStatus): Promise<void>;
  reorderTasks(taskIds: string[]): Promise<void>;      // v1.0 新增
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tag?: string | null;
  is_pinned?: boolean;
  remind_at?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
```

### 5.3 认证服务接口

```typescript
// ===== AuthContext =====

export interface IAuthContext {
  user: { id: string; email: string } | null;
  loading: boolean;
  signUp(email: string, password: string): Promise<{ error?: string }>;
  signIn(email: string, password: string): Promise<{ error?: string }>;
  signOut(): Promise<void>;
  resetPassword?(email: string): Promise<{ error?: string }>;  // v1.0 新增
}
```

### 5.4 离线同步接口

```typescript
// ===== app/lib/sync-service.ts（v1.0 新增） =====

export interface ISyncService {
  enqueue(action: OfflineAction): void;
  dequeueAll(): OfflineAction[];
  replay(): Promise<SyncResult>;
  clearSynced(): void;
}

export type SyncResult = {
  success: number;
  failed: Array<{ action: OfflineAction; error: string }>;
  conflicts: Array<{ local: Task; remote: Task; resolution: 'local' | 'remote' }>;
};
```

### 5.5 组件 Props 合约

```typescript
// 每个组件导出明确的 Props 类型

export type NavbarProps = {
  email?: string;
  onLogout: () => void;
  onToggleSidebar?: () => void;    // v1.0 新增：移动端侧边栏
};

export type TaskCardProps = {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;  // v1.0 新增
  swipeEnabled?: boolean;                          // v1.0 新增
};

export type TaskFormProps = {
  editingTask: Task | null;
  onSubmit: (data: CreateTaskInput) => void;
  onCancel: () => void;
  variant?: 'full' | 'quick';       // v1.0 新增：完整表单 vs 快速添加
};

export type EmptyStateProps = {      // v1.0 新增：统一空状态组件
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
};

export type ErrorBannerProps = {     // v1.0 新增：统一错误提示
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  severity: 'error' | 'warning' | 'info';
};
```

---

## 6. 状态流转

### 6.1 任务状态机

```
                    ┌─────────────────────────────┐
                    │                             │
                    ▼                             │
              ┌─────────┐                   ┌─────────┐
    创建 ──→ │  todo   │ ─────→  ──────→  │  doing  │
              └─────────┘                   └─────────┘
                    │                             │
                    │    ←────  退回  ←───────────┘
                    │
                    │  直接标记完成（跳过 doing）
                    ▼
              ┌─────────┐
              │  done   │
              └─────────┘
                    │
                    │  重新激活
                    ▼
              ┌─────────┐
              │  todo   │  （回到待办）
              └─────────┘
```

状态转换规则：
- `todo → doing`: 用户开始执行
- `doing → done`: 用户标记完成
- `doing → todo`: 退回（发现更多工作）
- `todo → done`: 直接完成（小任务可跳过 doing）
- `done → todo`: 重新激活（发现未完全完成）
- **禁止**: `done → doing`（已完成的任务必须先回到 todo）

### 6.2 UI 状态机

```
┌─────────────────────────────────────────────────┐
│              DashboardPage 状态机                │
├──────────────┬──────────────────────────────────┤
│ idle         │ 初始态，尚未加载数据              │
│ loading      │ 正在获取任务列表                  │
│ loaded       │ 数据已加载，展示任务列表          │
│ empty        │ 数据加载完成，但任务列表为空      │
│ creating     │ TaskForm 打开，创建模式           │
│ editing      │ TaskForm 打开，编辑模式           │
│ error        │ 数据加载失败                      │
│ offline      │ 无网络，展示本地缓存 + 离线提示    │
│ syncing      │ 网络恢复，正在同步离线操作        │
└──────────────┴──────────────────────────────────┘
```

### 6.3 认证状态机

```
┌────────────────────────────────────────┐
│           AuthProvider 状态机           │
├───────────┬────────────────────────────┤
│ init      │ 初始态，检测已有会话       │
│ loading   │ 正在验证 Supabase session  │
│ anonymous │ 未登录（显示登录/注册页）  │
│ loggedIn  │ 已登录（显示仪表盘）       │
│ error     │ 认证服务不可用             │
└───────────┴────────────────────────────┘
```

### 6.4 数据流

```
用户操作
  │
  ▼
组件事件处理 (onClick/onSubmit/onSwipe)
  │
  ▼
task-service.ts（统一服务层）
  │
  ├── 在线 ──→ Supabase API ──→ PostgreSQL
  │                                │
  │                                ▼
  │                           写入 localStorage 缓存
  │
  └── 离线 ──→ localStorage ──→ 离线队列
                    │
                    ▼
              网络恢复后 replay
```

---

## 7. 异常处理

### 7.1 错误分类

| 错误类别 | 场景 | 处理策略 |
|----------|------|----------|
| **网络错误** | 请求超时、DNS 失败、断网 | 自动重试 3 次（指数退避），失败后显示离线提示，写入离线队列 |
| **认证错误** | Token 过期、密码错误、邮箱未注册 | 清除本地 session，重定向到登录页，显示具体错误描述 |
| **权限错误** | RLS 拒绝、操作他人数据 | 静默失败 + console.error + 数据回滚 |
| **数据校验错误** | Title 为空、status 值非法 | 前端阻止提交，内联错误提示，输入框红色高亮 |
| **冲突错误** | 离线数据与服务端冲突 | 弹窗让用户选择保留本地/服务端版本 |
| **服务端错误** | Supabase 5xx、数据库宕机 | 显示 Error Banner（含重试按钮），保留用户已输入数据 |
| **渲染错误** | 组件异常、undefined 访问 | React Error Boundary 包裹关键区域，显示降级 UI |

### 7.2 错误边界设计

```typescript
// app/components/ErrorBoundary.tsx（v1.0 新增）

<ErrorBoundary
  fallback={<ErrorFallback onRetry={...} />}
>
  <DashboardPage />
</ErrorBoundary>
```

Error Boundary 包裹范围：
- `layout.tsx`（最外层，兜底整个应用）
- `DashboardPage`（核心页面）
- `TaskForm`（防止编辑状态丢失）

### 7.3 重试策略

```typescript
// app/lib/retry.ts（v1.0 新增）

/**
 * 带指数退避的自动重试
 * - 最大重试 3 次
 * - 退避间隔: 1s → 2s → 4s
 * - 仅对网络错误 (ECONNRESET, ETIMEDOUT, 5xx) 重试
 * - 4xx 错误不重试（客户端错误）
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; baseDelay?: number }
): Promise<T>
```

### 7.4 Toast 通知系统

```typescript
// app/lib/toast.tsx（v1.0 新增）

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';  // 移动端默认 bottom

toast.success('任务创建成功');
toast.error('网络连接失败，请检查网络');
toast.warning('该任务已逾期 3 天');
toast.info('正在同步离线数据...');
```

### 7.5 各场景异常处理表

| 操作 | 成功 | 网络错误 | 服务端错误 | 校验失败 |
|------|------|----------|-----------|----------|
| 登录 | 跳转 Dashboard | Toast + 保留输入 | Toast + 保留输入 | 内联提示 |
| 注册 | 自动登录 | Toast + 保留输入 | Toast + 保留输入 | 内联提示 |
| 创建任务 | Toast + 刷新列表 | 离线队列 + Toast | Toast + 保留表单 | 红色边框 |
| 编辑任务 | Toast + 刷新列表 | 离线队列 + Toast | Toast + 保留编辑 | 红色边框 |
| 删除任务 | Toast + 移除卡片 | 离线队列 + Toast | Toast + 恢复卡片 | N/A |
| 状态流转 | 即时 UI 更新 | 离线队列 + 回滚 UI | Toast + 回滚 UI | N/A |
| 列表加载 | 展示数据 | 展示缓存 + Toast | ErrorBanner + 重试 | N/A |

---

## 8. 安全、性能、可维护性

### 8.1 安全

#### 认证安全

```
● 密码传输: HTTPS 加密（Supabase Auth 内置）
● 会话管理: JWT Token，自动刷新，过期清除
● 演示模式: 数据仅存 localStorage，不离开浏览器
● 防暴力破解: Supabase Auth 内置速率限制
● XSS 防护: React 默认转义所有输出；dangerouslySetInnerHTML 禁用
```

#### 数据安全

```
● 行级安全 (RLS):
  - 每个用户只能读写自己的 tasks
  - user_id 由服务端 Trusted Auth 提供，前端不可篡改
  - 所有 SQL 操作均受策略约束

● 输入验证:
  - 前端: TypeScript 类型校验 + 表单必填验证
  - 后端: CHECK 约束（status, priority 枚举值）
  - 长度限制: title ≤ 200 chars, description ≤ 2000 chars

● 输出编码:
  - React JSX 自动转义
  - 无 innerHTML 使用
```

#### 通信安全

```
● Supabase API: HTTPS (TLS 1.3)
● Service Worker: 仅缓存同源资源
● CSP (Content Security Policy): 通过 Next.js headers 配置
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
```

### 8.2 性能

#### 加载性能指标与目标

| 指标 | 目标 | 测量方式 |
|------|------|----------|
| FCP (First Contentful Paint) | < 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| TTI (Time to Interactive) | < 3.0s | Lighthouse |
| TBT (Total Blocking Time) | < 200ms | Lighthouse |
| Speed Index | < 2.0s | Lighthouse |
| JS Bundle Size (首屏) | < 150KB gzip | Webpack Analyzer |

#### 优化策略

```
1. 代码分割 (Code Splitting)
   ├── 路由级: Next.js App Router 自动按 page 分割
   ├── 组件级: React.lazy + Suspense 懒加载非首屏组件
   │   - TaskForm: 仅在点击"新建"时加载
   │   - 看板视图: 仅在切换到看板时加载
   └── 库级: Supabase SDK 按需导入，避免全量引入

2. 资源优化
   ├── 图片: SVG 内联图标，无外部图片依赖
   ├── 字体: next/font 自动子集化 + 预加载
   │   - Geist Sans: Latin 子集 (~30KB)
   │   - 无中文字体下载（使用系统字体栈）
   └── CSS: Tailwind CSS 4 按需生成，移除未使用样式

3. 缓存策略
   ├── Service Worker 预缓存: /, /login, /register, /dashboard Shell
   ├── 静态资源: 版本化文件名 (Next.js 内置) + 1 年强缓存
   └── API 响应: SWR stale-while-revalidate, 30s 内存缓存

4. 渲染优化
   ├── 虚拟列表: 任务 > 50 条时启用（避免 DOM 节点过多）
   ├── useMemo: StatsCards 数据计算
   ├── useCallback: 事件处理函数稳定引用
   └── React.memo: TaskCard 避免无关重渲染

5. 网络优化
   ├── 预连接: <link rel="preconnect"> 到 Supabase API
   ├── 预加载: 关键 CSS/JS 通过 <link rel="preload">
   ├── 数据预取: 路由 hover 时预加载目标页面
   └── 请求合并: 批量操作使用 Promise.all
```

#### 性能监控

```
● Web Vitals: 通过 next/web-vitals 上报 Core Web Vitals
● Performance API: 自定义打点测量关键操作耗时
   - task-create-time: 创建任务响应时间
   - list-render-time: 列表渲染时间
● Lighthouse CI: 每次 PR 自动运行，性能回归拦截
```

### 8.3 可维护性

#### 代码组织

```
app/
├── components/          # UI 组件（展示层）
│   ├── ui/             # 通用 UI 组件（Button, Input, Toast...）
│   └── task/           # 业务组件（TaskCard, TaskForm...）
├── lib/                 # 逻辑层（无 UI 依赖）
│   ├── services/       # 外部服务（supabase, sync）
│   └── utils/          # 纯函数工具（date, retry, validation）
├── hooks/               # 自定义 Hooks（useTasks, useOnline...）
├── types/               # 类型定义
└── (pages)/             # 页面路由
```

#### 设计原则

```
1. 单一职责: 每个文件只做一件事
   - 组件: 展示 + 事件转发，不直接调用 API
   - Service: 数据操作，不含 UI 逻辑
   - Hook: 状态封装，可跨组件复用

2. 依赖倒置: 业务逻辑依赖抽象接口
   - task-service.ts 依赖 ITaskService 接口
   - DashboardPage 注入服务实例，不直接依赖 Supabase

3. 错误隔离: Error Boundary + 降级 UI
   - 每个 Error Boundary 只包裹一个功能区域
   - 组件内部 try-catch 保护副作用

4. 类型安全: 严格模式 TypeScript
   - 所有函数有明确入参/返回值类型
   - 禁止 any（ESLint rule）
   - Props 类型集中导出，不在组件内联定义

5. 测试策略:
   ├── 单元测试: lib/ 纯逻辑函数（vitest）
   ├── 组件测试: 交互 + 渲染快照（vitest + @testing-library/react）
   ├── E2E: 关键用户路径（Playwright）
   └── 覆盖率目标: 行 ≥ 80%, 分支 ≥ 70%
```

#### Git 规范

```
分支命名: feat/task-reminders, fix/login-error, chore/deps-update
Commit:   feat: 截止日期提醒功能
          fix: 登录页密码错误无提示
          chore: 升级 Next.js 到 16.3
PR:       关联 Issue，附截图/录屏，通过 CI 后合并
```

#### 文档维护

```
● SDD.md: 本文件，架构变更时同步更新
● DEVELOPMENT.md: 本地开发指南，环境配置
● DEMO.md: 演示步骤，每次功能发布更新
● TEST_CHECKLIST.md: 手动测试清单，发版前验证
● README.md: 项目概览，快速启动指南
```

---

## 附录 A：v1.0 vs v0.1 差异矩阵

| 维度 | v0.1 (当前) | v1.0 (目标) |
|------|------------|------------|
| 定位 | 桌面 Web 原型 | 移动优先 PWA |
| 导航 | 顶部 Navbar | 底部 TabBar + 顶部 Navbar |
| 触控 | 无 | 滑动/长按/下拉刷新 |
| 离线 | 演示模式（需手动切换） | Service Worker 自动离线缓存 |
| 通知 | 无 | Web Push + 截止提醒 |
| 视图 | 单一列表 | 列表 + 今日 + 看板（3 种） |
| 排序 | 手动拖拽 | ✅ 已实现（v0.1） |
| 数据导出 | 无 | CSV/JSON 导出 |
| 任务字段 | 7 个 | 11 个（新增 is_pinned, order_index, remind_at, updated_at） |
| 错误处理 | console.error 静默 | Toast + ErrorBoundary + 重试 |
| 测试 | 手动清单 | 单元 + 组件 + E2E |
| 性能预算 | 无 | FCP < 1.5s, Bundle < 150KB |
| PWA | 无 | Manifest + SW + 可安装 |

---

## 附录 B：移动端 UI 布局规范

```
┌──────────────────────────┐
│      Status Bar          │  (系统状态栏)
├──────────────────────────┤
│  TaskFlow          [+]   │  (顶部栏: Logo + 快捷创建 FAB)
├──────────────────────────┤
│  ┌────┬────┬────┬────┐  │
│  │全部│待办│进行│完成│  │  (统计条: 横向滚动)
│  └────┴────┴────┴────┘  │
├──────────────────────────┤
│  🔍 搜索任务...          │  (搜索栏: 可折叠)
│  [全部状态 ▾] [排序 ▾]  │  (筛选栏: 可折叠)
├──────────────────────────┤
│                          │
│  ┌────────────────────┐  │
│  │ 📌 完成项目报告    │  │  (置顶任务: 浅色背景)
│  │    高优先 · 明天   │  │
│  │    ──────────────→ │  │  (右滑完成)
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ 购买生活用品       │  │  (普通任务)
│  │    中优先 · 待定   │  │
│  └────────────────────┘  │
│                          │
├──────────────────────────┤
│  📋 任务  📊 统计  👤 我 │  (底部 TabBar)
└──────────────────────────┘
```
