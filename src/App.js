import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { App as AntAppProvider } from 'antd'; 
import 'antd/dist/reset.css';
// --- Layouts ---
import PrivateLayout from './components/layout/PrivateLayout'; // Giả sử bạn có layout này
import PublicLayout from './components/layout/PublicLayout';   // và layout này
import PlanningPage from './features/planning/PlanningPage';
// --- Pages ---
import LoginPage from './components/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Module: Cá nhân

import TimekeepingPage from './components/timekeeping/TimekeepingPage';
//import ProfilePage from './pages/ProfilePage'; 

// Module: KPI
import BscConfigPage from './pages/BscConfigPage';
import KpiPlanPage from './pages/KpiPlanPage';
import MyKpiPage from './pages/MyKpiPage';  
import ManagerKpiDashboard from './pages/ManagerKpiDashboard';

import CompanyKpiRegistrationPage from './pages/CompanyKpiRegistrationPage';
import CompanyMonthlyResultPage from './pages/CompanyMonthlyResultPage';



// Module: Bảng lương
import PayrollDashboard from './features/payroll/PayrollDashboard';

// Module: Nhân sự (HRM)
import HrmDashboard from './components/hrm/HrmDashboard';
//import JobPostingsPage from './components/recruitment/JobPostingsPage';
//import CourseCatalogPage from './components/training/CourseCatalogPage';
import EmployeeProfilePage from './components/hrm/EmployeeProfilePage';
import MyProfilePage from './pages/MyProfilePage';
// Module: Cấu hình (Admin)
import CompanyManagement from './pages/CompanyPage'; 
import DepartmentManagement from './pages/DepartmentPage';
import KpiLibraryPage from './pages/KpiLibraryPage';
import CreateUserPage from './pages/admin/CreateUserPage';

// Module: Báo cáo
import BiPage from './components/bi/BiPage';

function App() {
  return (
    <AntAppProvider>
       <AuthProvider> 
    
          <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
             <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* === PRIVATE ROUTES === */}
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/my-timesheet" element={<TimekeepingPage />} />
            <Route path="/my-kpi-plan/:employeeId" element={<MyKpiPage />} />
            <Route path="/my-kpi" element={<KpiPlanPage />} /> 
           
            <Route path="/my-profile" element={<MyProfilePage />} />
            {/* Kế hoạch */}
            <Route path="/planning" element={<PlanningPage />} />
            {/* --- Module: Bảng lương --- */}
            <Route path="/payroll" element={<PayrollDashboard />} />

            {/* --- Module: KPI --- */}
           
            {/*<Route path="/kpi-evaluation/:employeeId" element={<KpiPlanPage />} />*/}
            <Route path="/perspective-weights" element={<BscConfigPage/>} />
            <Route path="/kpi/manager-kpi-dashboard" element={<ManagerKpiDashboard />} />
            <Route path="/company-kpi-registration" element={<CompanyKpiRegistrationPage />} />
            <Route path="/company-monthly-result" element={<CompanyMonthlyResultPage />} />
            <Route path="/companies" element={<CompanyManagement />} />
            <Route path="/departments" element={<DepartmentManagement />} />
            <Route path="/kpi-library" element={<KpiLibraryPage />} />
           
            {/* --- Module: Nhân sự (HRM) --- */}
            <Route path="/hrm" element={<HrmDashboard />} />
           {/*<Route path="/recruitment" element={<JobPostingsPage />} />*/}
           {/* <Route path="/training/courses" element={<CourseCatalogPage />} />*/}
           <Route path="/hrm/employees/:id" element={<EmployeeProfilePage />} />
             
      
            
            {/* 2. THÊM ROUTE MỚI DÀNH CHO ADMIN */}
          <Route path="/admin/create" element={<CreateUserPage />} />
            
                 {/* --- Module: Báo cáo --- */}
            <Route path="/bi-analytics" element={<BiPage />} />

            {/* === Default Route === */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<div>404 Not Found</div>} /> 
          </Route>
        </Routes>

   

          </AuthProvider>
    </AntAppProvider>
  );
}

export default App;
