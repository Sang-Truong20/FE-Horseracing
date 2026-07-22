import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import OwnerLayout from "../layout/OwnerLayout"; 
import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import ManageHorses from "../pages/Owner/ManageHorses";
import ManageRaces from "../pages/Owner/ManageRaces";
import ManageJockeys from "../pages/Owner/ManageJockeys";
import ManageWallet from "../pages/Owner/ManageWallet";
import OwnerInvites from "../pages/Owner/OwnerInvites";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminOwners from "../pages/Admin/AdminOwners";
import AdminJockeys from "../pages/Admin/AdminJockeys";
import AdminRaces from "../pages/Admin/AdminRaces";
import AdminGifts from "../pages/Admin/AdminGifts";

import AdminReferees from "../pages/Admin/AdminReferees";

import AdminWithdrawals from "../pages/Admin/AdminWithdrawals";
import JockeyLayout from "../layout/JockeyLayout";
import JockeyHorses from "../pages/Jockey/JockeyHorses";
import JockeyRequests from "../pages/Jockey/JockeyRequests";
import JockeySchedule from "../pages/Jockey/JockeySchedule";
import JockeyIncome from "../pages/Jockey/JockeyIncome";
import JockeyWallet from "../pages/Jockey/JockeyWallet";
import JockeyPenalties from "../pages/Jockey/JockeyPenalties";
import RefereeLayout from "../layout/RefereeLayout";
import RefereeDashboard from "../pages/Referee/RefereeDashboard";
import RefereePendingAppeals from "../pages/Referee/RefereePendingAppeals";
import RefereeRaceDetail from "../pages/Referee/RefereeRaceDetail";
import PaymentResult from "../pages/PaymentResult";
import EndUserHome from "../pages/EndUser/EndUserHome";


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
    path: "/register",
    element: <Register />,
  },
  {
    path: "/payment-result",
    element: <PaymentResult />,
  },
  {

    path: "/end-user",
    element: <ProtectedRoute allowRole="EndUser" />,
    children: [
      {
        index: true,
        element: <EndUserHome />,
      },
    ],
  },
  {
    path: "/profile",
    element: <ProtectedRoute allowRole="EndUser" />,
    children: [
      {
        index: true,
        element: <Profile />,
      },
    ],
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
        path: "invites",
        element: <OwnerLayout><OwnerInvites /></OwnerLayout>,
      },
      {
        path: "profile",
        element: <OwnerLayout><Profile /></OwnerLayout>,
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
        path: "referees",
        element: <AdminReferees />,
      },
      {
        path: "races",
        element: <AdminRaces />,
      },
      {
        path: "gifts",
        element: <AdminGifts />,
      },
      {
        path: "withdrawals",
        element: <AdminWithdrawals />,
      },
    ],
  },
  {
    path: "/jockey",
    element: <ProtectedRoute allowRole="Jockey" />,
    children: [
      {
        index: true,
        element: <Navigate to="requests" replace />,
      },
      {
        path: "races",
        element: <JockeyLayout><JockeySchedule /></JockeyLayout>,
      },
      {
        path: "income",
        element: <JockeyLayout><JockeyIncome /></JockeyLayout>,
      },
      {
        path: "wallet",
        element: <JockeyLayout><JockeyWallet /></JockeyLayout>,
      },
      {
        path: "requests",
        element: <JockeyLayout><JockeyRequests /></JockeyLayout>,
      },
      {
        path: "horses",
        element: <JockeyLayout><JockeyHorses /></JockeyLayout>,
      },
      {
        path: "penalties",
        element: <JockeyLayout><JockeyPenalties /></JockeyLayout>,
      }
    ],
  },
  {
    path: "/referee",
    element: <ProtectedRoute allowRole="Referee" />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <RefereeLayout><RefereeDashboard /></RefereeLayout>,
      },
      {
        path: "races",
        element: <RefereeLayout><RefereeDashboard /></RefereeLayout>,
      },
      {
        path: "pending",
        element: <RefereeLayout><RefereeDashboard /></RefereeLayout>,
      },
      {
        path: "appeals",
        element: <RefereeLayout><RefereePendingAppeals /></RefereeLayout>,
      },
      {
        path: "races/:id",
        element: <RefereeLayout><RefereeRaceDetail /></RefereeLayout>,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
