"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { hydrateAuth } from "../../redux/slices/authSlice";
import { syncFromBackend } from "../../redux/store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children, requiredRole }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
    syncFromBackend(dispatch);
    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user) {
        router.replace("/login");
      } else if (requiredRole && user.role !== requiredRole) {
        // Strict role locking: No cross-role access allowed
        const target =
          user.role === "Administrator"
            ? "/admin/dashboard"
            : user.role === "Manager"
            ? "/manager/dashboard"
            : "/employee/dashboard";
        router.replace(target);
      }
    }
  }, [mounted, isAuthenticated, user, requiredRole, router]);

  // Handle responsive collapse on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted || !isAuthenticated || !user || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div style={{

        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        color: "var(--text-secondary)",
        flexDirection: "column",
        gap: "12px",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--primary-border)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <span style={{ fontSize: "14px", fontWeight: "500" }}>Loading ApexTech portal...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="main-content-wrapper">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="page-container animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
