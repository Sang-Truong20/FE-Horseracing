import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";
// ĐẢM BẢO ĐÃ IMPORT CÁC FILE NÀY
import OwnerLayout from "../layout/OwnerLayout"; 
import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import ManageHorses from "../pages/Owner/ManageHorses";

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
    element: <Navigate to="/owner" replace />,
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
        path: "horses",
        element: <OwnerLayout><ManageHorses /></OwnerLayout>,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);