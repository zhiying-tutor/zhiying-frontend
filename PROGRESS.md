# PROGRESS.md

最后更新：2026-04-25

## 当前状态

项目已完成基础设施（API client、认证、App Shell）、认证入口（登录/注册）、Dashboard（主区 + 右侧栏 parallel route）、以及创建学习主题流程（表单 + 消费确认 + Server Action）。

## 已完成

### 阶段 0：基础设施

- `src/lib/api/client.ts`：`serverFetch` 封装——统一 base URL、Authorization 注入、Zod schema 校验、错误归一化。
- `src/lib/api/schemas.ts`：按后端端点补全 Zod schema（user、study-subject、pretest、study-stage/task/quiz、problem、checkin、四类资源、public config）。
- `src/app/api/auth/{login,register,logout}/route.ts`：代理后端 `/tokens`、`/users`，写/清 httpOnly cookie。
- `src/lib/auth/session.ts`：`getSession()` 读 cookie 并调用 `/me`。
- `src/middleware.ts`：未登录访问受保护路由重定向到 `/login`。
- `src/app/layout.tsx`：根布局——字体（Inter + Geist）、Toaster。
- `src/app/globals.css`：N2W 暖色主题 token（`@theme inline`），不覆盖 Tailwind 默认 border-radius。

### 阶段 1：认证入口

- `src/app/(auth)/login/page.tsx`、`register/page.tsx`：独立页面，复用 `auth-modal-preview.html` 视觉。
- `src/components/auth/`：LoginForm、RegisterForm、AuthCardHeader/Footer、共享字段组件。
- 表单使用 TanStack Form + Zod，提交走 Server Action → 代理 route → 成功后 `redirect('/dashboard')`。

### 阶段 2：Dashboard + 布局重构

- `src/app/(app)/layout.tsx`：两列布局壳（`children` + `aside` parallel route slot）。
- `src/app/(app)/@aside/default.tsx`：返回 `null`（软导航 fallback）。
- `src/app/(app)/@aside/dashboard/page.tsx`：右侧栏——档案 banner + 头像 + 昵称 + 4 格 stats（等级/连续登录/金币/钻石）+ 签到按钮 + 新手图鉴入口 + AI 聊天面板壳。
- `src/app/(app)/dashboard/page.tsx`：RSC 并发拉 `/me` + `/study-subjects` + `/config`。主区含大标题、搜索栏（视觉占位）、计划列表（带状态徽章 + 进度条）或空态 CTA。
- `src/app/(app)/dashboard/actions.ts`：`checkinAction()`、`createSubjectAction()` Server Action。
- `src/components/dashboard/checkin-button.tsx`：客户端签到按钮。
- 已删除旧侧栏/顶栏组件（sidebar、top-bar、currency-badge）。

### 阶段 3（部分）：创建学习主题

- `src/lib/api/public-config.ts`：`getPublicConfig()` 通过 React `cache()` 拉取 `GET /config`。
- `src/components/spend-confirm-dialog.tsx`：通用消费确认对话框（支持钻石/金币，显示余额变化与不足提示）。
- `src/components/dashboard/create-subject-button.tsx`：两步模态框（表单 → 确认）——选择主题、语言（PYTHON/JAVA/CPP/GO/RUST）、阶段数（从 `/config` pricing 拉取）、学习目标。
- Dashboard EmptyState CTA 已启用；已有计划列表区域新增"新建计划"按钮。

### 其他

- 修复 Tailwind v4 圆角：删除 shadcn 生成的 `--radius` 覆盖，回归 Tailwind 原生默认值。
- 同步后端字段重命名：`total_checkin` → `total_checkins`，`streak_checkin` → `streak_checkins`。

## 尚未完成

- 阶段 3 剩余：状态机轮询（引入 TanStack Query）、学前测页面（`/pretest/[id]`）、骨架加载组件。
- 阶段 4：学习主线（subjects/tasks 详情页、四类资源渲染、资源生成轮询）。
- 阶段 5：小测 + 错题本。
- 阶段 6：游戏化与反馈（奖励弹窗、HUD 联动）。
- 阶段 7：打磨（空态/错误态/骨架态审查、RSC 边界优化、暗色模式走查）。

## 下一步建议

1. 引入 TanStack Query，在 `(app)` layout 注入 `QueryClientProvider`。
2. 实现学前测页面：轮询 `study_subject` 状态至 `PRETEST_READY`，渲染题目列表，逐题 PATCH + POST plan。
3. 封装骨架加载组件（参考 `skeleton-loading-preview.html`）。
