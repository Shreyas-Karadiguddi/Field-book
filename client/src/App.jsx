import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { LoginPage } from '@/pages/login-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { ClientsListPage } from '@/pages/clients-list-page';
import { ClientDetailPage } from '@/pages/client-detail-page';
import { FollowUpsPage } from '@/pages/follow-ups-page';
import { AreaMapPage } from '@/pages/area-map-page';
import { PipelinePage } from '@/pages/pipeline-page';
import { PerformancePage } from '@/pages/performance-page';
import { PlaceholderPage } from '@/pages/placeholder-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsListPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/visits" element={<PlaceholderPage title="Visits" />} />
            <Route path="/follow-ups" element={<FollowUpsPage />} />
            <Route path="/area-map" element={<AreaMapPage />} />
            <Route path="/reports/performance" element={<PerformancePage />} />
            <Route path="/reports/pipeline" element={<PipelinePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
