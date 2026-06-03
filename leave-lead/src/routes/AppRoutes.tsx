import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/data/users";
import { Layout } from "@/components/layout/Layout";

// Import de tes pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import LeavesPage from "@/pages/LeavesPage";
import LeaveValidationPage from "@/pages/LeaveValidationPage";
import AttendancePage from "@/pages/AttendancePage";
import AbsencesPage from "@/pages/AbsencesPage";
import UsersPage from "@/pages/UsersPage";
import ExcelImportPage from "@/pages/ExcelImportPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import HolidaysPage from "@/pages/HolidaysPage";
import ProfilePage from "@/pages/ProfilePage";
import TeamPage from "@/pages/TeamPage";
import NotFound from "@/pages/NotFound";
import LeaveTypesPage from "@/pages/LeaveTypesPage";
import HistoriquePage from "@/pages/HistoryPage";
import ManagementEquipePage from "@/pages/ManagementEquipePage";

// Petit composant Spinner pour le chargement
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

const Protected = ({ children, roles }: { children: JSX.Element; roles?: Role[] }) => {
  const { user, loading } = useAuth();

  // Remplacement du null par le Spinner
  if (loading) return <LoadingSpinner />;

  // Si pas de user -> Login
  if (!user) return <Navigate to="/login" replace />;

  // Vérification des rôles (compare les minuscules de ton Enum)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => (
  <Routes>
    {/* Routes Publiques */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />

    {/* Routes Utilisateurs Connectés */}
    <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
    <Route path="/leaves" element={<Protected><LeavesPage /></Protected>} />
    <Route path="/attendance" element={<Protected><AttendancePage /></Protected>} />
    <Route path="/absences" element={<Protected><AbsencesPage /></Protected>} />
    <Route path="/holidays" element={<Protected><HolidaysPage /></Protected>} />
    <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
    <Route path="/historique" element={<Protected><HistoriquePage /></Protected>} />
    {/* Routes Manager / RH / Chef d'équipe */}
    <Route 
      path="/leaves/validate" 
      element={<Protected roles={[Role.manager, Role.chef_equipe, Role.DRH]}><LeaveValidationPage /></Protected>} 
    />
    <Route 
      path="/departments" 
      element={<Protected roles={[Role.manager, Role.chef_equipe, Role.DRH]}><DepartmentsPage /></Protected>} 
    />
    <Route path="/team" element={<Protected roles={[Role.manager, Role.chef_equipe, Role.DRH]}><TeamPage /></Protected>} />
    <Route path="/chef" element={<Protected roles={[Role.manager]}><ManagementEquipePage /></Protected>} />
    

    {/* Routes Strictement RH (Cas 2 : Gestion des utilisateurs) */}
    <Route path="/users" element={<Protected roles={[Role.DRH]}><UsersPage /></Protected>} />
    <Route path="/users/import" element={<Protected roles={[Role.DRH]}><ExcelImportPage /></Protected>} />
    <Route path="/leave-types" element={<Protected roles={[Role.DRH]}><LeaveTypesPage /></Protected>} />
    <Route path="/historique" element={<Protected roles={[Role.DRH]}><HistoriquePage /></Protected>} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;