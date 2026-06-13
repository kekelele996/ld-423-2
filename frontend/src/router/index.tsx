import { Navigate, NavLink, Outlet, createBrowserRouter } from 'react-router-dom';
import { ChartEditor } from '../pages/ChartEditor';
import { ChartGallery } from '../pages/ChartGallery';
import { ReportBuilder } from '../pages/ReportBuilder';
import { Statistics } from '../pages/Statistics';
import { Workspace } from '../pages/Workspace';
import { useThemeStore } from '../stores/themeStore';

const AppShell = () => {
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  return (
    <div className="app-shell" data-theme={mode}>
      <nav className="main-nav">
        <strong>LabVista</strong>
        <NavLink to="/workspace">工作台</NavLink>
        <NavLink to="/chart-editor">编辑器</NavLink>
        <NavLink to="/report-builder">报告</NavLink>
        <NavLink to="/statistics">统计</NavLink>
        <NavLink to="/charts">图表库</NavLink>
        <button type="button" onClick={toggleTheme}>{mode === 'dark' ? '浅色' : '深色'}</button>
      </nav>
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/workspace" replace /> },
      { path: 'workspace', element: <Workspace /> },
      { path: 'chart-editor', element: <ChartEditor /> },
      { path: 'report-builder', element: <ReportBuilder /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'charts', element: <ChartGallery /> },
    ],
  },
]);
