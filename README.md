# 科研数据可视化分析工具

纯前端科研数据分析与图表绘制平台，支持 CSV/JSON 导入、多维筛选、图表配置、统计摘要和报告组装。数据优先写入 IndexedDB，主题设置写入 localStorage。

## 启动方式

```bash
npm install
npm run dev
```

访问地址：http://localhost:18803

## 技术栈

| 类型 | 技术 |
| --- | --- |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 图表 | ECharts 5 |
| 样式 | Tailwind CSS + CSS Variables |
| 表格 | AG Grid Community |
| CSV 解析 | PapaParse |
| 拖拽 | @dnd-kit/core |
| 状态管理 | Zustand |
| 本地存储 | IndexedDB / Dexie.js |
| 路由 | React Router v6 |

## 目录结构

```text
frontend/src/
├── api/
├── stores/
├── types/
├── components/common/
├── hooks/
├── pages/
├── router/
├── utils/
├── constants/
└── styles/
```

枚举定义位于 `frontend/src/types/enums.ts`，包含 ChartType、DataType、FilterOperator、ColorScheme。

## License

MIT
