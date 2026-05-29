
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { DashboardHome } from '@/features/analytics/components/DashboardHome';
import { ProjectListPage } from '@/features/projects/components/ProjectListPage';

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
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/teams" element={
            <div className="p-12 text-center text-muted-foreground">Teams Page (Coming Soon)</div>
          } />
          
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">General Settings</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
