
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { DashboardHome } from '@/features/analytics/components/DashboardHome';
import { ProjectListPage } from '@/features/projects/components/ProjectListPage';

import { TeamListPage } from '@/features/teams/components/TeamListPage';
import { SprintListPage } from './features/sprints/components/SprintListPage';
import { TaskListPage } from '@/features/tasks/components/TaskListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/health" element={<div className="p-8 text-white">Project Health (Coming Soon)</div>} />
          <Route path="/risks" element={<div className="p-8 text-white">Risk Analysis (Coming Soon)</div>} />
          <Route path="/predictive" element={<div className="p-8 text-white">Predictive Insights (Coming Soon)</div>} />
          <Route path="/reports" element={<div className="p-8 text-white">Reports (Coming Soon)</div>} />
          <Route path="/dependencies" element={<div className="p-8 text-white">Dependency Map (Coming Soon)</div>} />
          <Route path="/timeline" element={<div className="p-8 text-white">Timeline (Coming Soon)</div>} />
          <Route path="/backlog" element={<div className="p-8 text-white">Backlog (Coming Soon)</div>} />
          <Route path="/milestones" element={<div className="p-8 text-white">Milestones (Coming Soon)</div>} />
          <Route path="/workload" element={<div className="p-8 text-white">Workload (Coming Soon)</div>} />
          <Route path="/communication" element={<div className="p-8 text-white">Communication (Coming Soon)</div>} />
          <Route path="/jira" element={<div className="p-8 text-white">Jira Integration (Coming Soon)</div>} />
          <Route path="/github" element={<div className="p-8 text-white">GitHub Integration (Coming Soon)</div>} />
          <Route path="/slack" element={<div className="p-8 text-white">Slack Integration (Coming Soon)</div>} />
          <Route path="/cicd" element={<div className="p-8 text-white">CI/CD Integration (Coming Soon)</div>} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/teams" element={<TeamListPage />} />
          <Route path="/sprints" element={<SprintListPage />} />
          <Route path="/tasks" element={<TaskListPage />} />
          
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">Project Settings</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
