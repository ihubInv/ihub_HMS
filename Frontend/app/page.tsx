"use client"

import { useDispatch, useSelector } from "react-redux"
import { LoginForm } from "@/components/auth/login-form"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { WardenDashboard } from "@/components/dashboard/warden-dashboard"
import { logout } from "@/lib/store/slices/auth.slice"
import { selectCurrentUser, selectIsAuthenticated } from "@/lib/store/selectors/auth.selector"

export default function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === "admin" && <AdminDashboard user={user} onLogout={handleLogout} />}
      {user.role === "warden" && <WardenDashboard user={user} onLogout={handleLogout} />}
      {user.role === "student" && <StudentDashboard user={user} onLogout={handleLogout} />}
    </div>
  );
}
