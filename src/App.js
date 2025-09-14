import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd';

import PublicLayout from './layout/PublicLayout';
import PrivateLayout from './layout/PrivateLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

import TimekeepingPage from './pages/TimekeepingPage';
import MyKpiPage from './pages/MyKpiPage';
import KpiPlanPage from './pages/KpiPlanPage';
import MyProfilePage from './pages/MyProfilePage';
import PlanningPage from './features/planning/PlanningPage';
import PayrollDashboard from './pages/PayrollDashboard';
import BscConfigPage from './pages/BscConfigPage';
import ManagerKpiDashboard from './pages/ManagerKpiDashboard';
import CompanyKpiRegistrationPage from './pages/CompanyKpiRegistrationPage';
import CompanyMonthlyResultPage from './pages/CompanyMonthlyResultPage';
import CompanyManagement from './pages/CompanyPage';
import DepartmentManagement from './pages/DepartmentPage';
import KpiLibraryPage from './pages/KpiLibraryPage';
import CreateUserPage from './pages/admin/CreateUserPage';
import HrmDashboard from './hrm/HrmDashboard';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import BiPage from './pages/BiPage';

export default function App() {
  return (
    <AntApp>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Private: luôn có Header + Sidebar từ MainLayout */}
        <Route element={<PrivateLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Các trang nội bộ khác */}
          <Route path="/my-timesheet" element={<TimekeepingPage />} />
          <Route path="/my-kpi-plan/:employeeId" element={<MyKpiPage />} />
          <Route path="/my-kpi" element={<KpiPlanPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/payroll" element={<PayrollDashboard />} />
          <Route path="/perspective-weights" element={<BscConfigPage />} />
          <Route path="/kpi/manager-kpi-dashboard" element={<ManagerKpiDashboard />} />
          <Route path="/company-kpi-registration" element={<CompanyKpiRegistrationPage />} />
          <Route path="/company-monthly-result" element={<CompanyMonthlyResultPage />} />
          <Route path="/companies" element={<CompanyManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/kpi-library" element={<KpiLibraryPage />} />
          <Route path="/admin/create" element={<CreateUserPage />} />
          <Route path="/hrm" element={<HrmDashboard />} />
          <Route path="/hrm/employees/:id" element={<EmployeeProfilePage />} />
          <Route path="/bi-analytics" element={<BiPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AntApp>
  );
}
