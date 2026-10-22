"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";




export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Entering the site / opening localhost always brings up login credentials
    dispatch(logout());
    router.replace("/login");
  }, [dispatch, router]);


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
      <span style={{ fontSize: "14px", fontWeight: "500" }}>Redirecting to portal...</span>
    </div>
  );
}
