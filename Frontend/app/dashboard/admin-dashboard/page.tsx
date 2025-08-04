"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { selectCurrentUser } from "@/lib/store/selectors/auth.selector";
import { logout } from "@/lib/store/slices/auth.slice";

export default function AdminDashboardPage() {
  // Get the user from Redux state
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const onLogout = () => dispatch(logout());

  useEffect(() => {
    if (!user) {
      router.push("/"); // Redirect to login if not authenticated
    }
  }, [user, router]);

  if (!user) return null;
  return <AdminDashboard user={user} onLogout={onLogout} />;
} 