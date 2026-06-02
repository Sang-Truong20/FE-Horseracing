import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";
// ĐẢM BẢO ĐÃ IMPORT CÁC FILE NÀY
import OwnerLayout from "../layout/OwnerLayout"; 
import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import ManageHorses from "../pages/Owner/ManageHorses";
import ManageRaces from "../pages/Owner/ManageRaces";
import ManageJockeys from "../pages/Owner/ManageJockeys";
import ManageWallet from "../pages/Owner/ManageWallet";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminOwners from "../pages/Admin/AdminOwners";
import AdminJockeys from "../pages/Admin/AdminJockeys";
import AdminRaces from "../pages/Admin/AdminRaces";

// Component bảo vệ route
const ProtectedRoute = ({ allowRole }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== allowRole) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/owner",
    element: <ProtectedRoute allowRole="OwnerHorse" />,
    children: [
      {
        index: true,
        element: <OwnerLayout><OwnerDashboard /></OwnerLayout>,
      },
      {
        path: "jockey",
        element: <OwnerLayout><ManageJockeys /></OwnerLayout>,
      },
      {
        path: "races",
        element: <OwnerLayout><ManageRaces /></OwnerLayout>,
      },
      {
        path: "wallet",
        element: <OwnerLayout><ManageWallet /></OwnerLayout>,
      },
      {
        path: "horses",
        element: <OwnerLayout><ManageHorses /></OwnerLayout>,
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowRole="Admin" />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "owners",
        element: <AdminOwners />,
      },
      {
        path: "jockeys",
        element: <AdminJockeys />,
      },
      {
        path: "races",
        element: <AdminRaces />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
