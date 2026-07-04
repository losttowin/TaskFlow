# TaskFlow - 简洁高效的任务管理工具

基于 Next.js + TypeScript + Tailwind CSS + Supabase 构建的 Todo List Web 应用。

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 演示模式

未配置 Supabase 时，应用自动使用浏览器本地存储（localStorage），无需任何后端即可完整体验所有功能。

## 连接 Supabase

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 复制项目 URL 和 anon key
3. 修改 `.env.local` 中的配置
4. 在 Supabase SQL Editor 中运行以下 SQL：

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  tag text,
  created_at timestamp with time zone default now()
);

alter table tasks enable row level security;

create policy "Users can view own tasks" on tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert own tasks" on tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks" on tasks
  for delete using (auth.uid() = user_id);
```

## 项目结构

```
taskflow/
├── app/
│   ├── login/page.tsx        # 登录页
│   ├── register/page.tsx     # 注册页
│   ├── dashboard/page.tsx    # 仪表盘（核心页面）
│   ├── components/
│   │   ├── Navbar.tsx        # 导航栏
│   │   ├── TaskForm.tsx      # 任务表单
│   │   ├── TaskList.tsx      # 任务列表
│   │   ├── TaskCard.tsx      # 任务卡片
│   │   ├── TaskFilter.tsx    # 筛选器
│   │   └── StatsCards.tsx    # 统计卡片
│   ├── lib/
│   │   ├── supabase.ts       # Supabase 客户端
│   │   ├── local-storage.ts  # 本地存储
│   │   ├── auth-context.tsx  # 认证上下文
│   │   └── task-service.ts   # 任务服务层
│   ├── types/task.ts         # 类型定义
│   ├── layout.tsx
│   └── page.tsx
├── middleware.ts
├── .env.local
└── docs/                     # 项目文档
```

## 技术栈

- **Next.js 16** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式
- **Supabase** - 认证 + PostgreSQL + RLS
