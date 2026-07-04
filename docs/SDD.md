# TaskFlow 规范驱动开发文档 (SDD)

## 1. 项目概述

TaskFlow 是一个简洁高效的个人任务管理 Web 应用，帮助用户轻松组织和追踪工作进度。

## 2. 核心功能

- 用户注册与登录
- 任务创建、编辑、删除（CRUD）
- 任务状态流转：todo → doing → done
- 任务优先级：low / medium / high
- 任务筛选（状态、优先级、关键词搜索）
- 统计面板（全部/待办/进行中/已完成/逾期/完成率）
- 截止日期与逾期提醒

## 3. 非功能需求

- 支持演示模式（无后端依赖，开箱即用）
- 响应式设计（适配桌面和移动端）
- 数据安全（Supabase RLS 行级安全）
- 任务上限 100 条（演示模式无限制）

## 4. 数据模型

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',      -- todo | doing | done
  priority text default 'medium',  -- low | medium | high
  due_date date,
  tag text,
  created_at timestamp with time zone default now()
);
```

## 5. 路由设计

| 路由 | 说明 | 认证 |
|------|------|------|
| `/` | 首页（已登录跳转 dashboard） | 否 |
| `/login` | 登录页 | 否 |
| `/register` | 注册页 | 否 |
| `/dashboard` | 仪表盘（核心工作区） | 是 |

## 6. 组件树

```
App
├── Navbar (导航栏)
├── HomePage (首页)
├── LoginPage (登录)
├── RegisterPage (注册)
└── DashboardPage (仪表盘)
    ├── StatsCards (统计卡片)
    ├── TaskForm (任务表单)
    ├── TaskFilter (筛选器)
    └── TaskList (任务列表)
        └── TaskCard (任务卡片) × N
```
