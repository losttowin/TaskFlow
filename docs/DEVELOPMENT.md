# TaskFlow 开发指南

## 环境要求

- Node.js 18+
- npm 9+

## 本地开发

```bash
npm install
npm run dev
```

应用在 http://localhost:3000 启动。

## 演示模式 vs Supabase 模式

| 功能 | 演示模式 | Supabase 模式 |
|------|----------|--------------|
| 用户注册/登录 | localStorage 模拟 | Supabase Auth |
| 任务 CRUD | localStorage 存储 | PostgreSQL |
| 数据隔离 | 单用户 | RLS 多用户 |
| 数据持久性 | 浏览器级别 | 数据库级别 |

演示模式无需任何配置即可使用，适合快速体验和开发调试。

## 项目架构

```
用户界面层 (Pages/Components)
    ↕
服务抽象层 (task-service.ts)
    ↕
存储层 (localStorage | Supabase)
```

### 核心文件

- `app/lib/task-service.ts` — 任务服务统一接口，自动选择本地或 Supabase 后端
- `app/lib/auth-context.tsx` — 认证上下文，统一管理用户状态
- `app/lib/supabase.ts` — Supabase 客户端初始化
- `app/lib/local-storage.ts` — localStorage 存储实现

### 切换到 Supabase

1. 在 Supabase 创建项目
2. 修改 `.env.local` 填入真实配置
3. 在 Supabase SQL Editor 执行建表 SQL（见 README.md）
4. 重启开发服务器

应用会自动检测并切换到 Supabase 模式。
