"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: "#f9fafb", 
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      <div style={{ 
        maxWidth: "500px", 
        margin: "0 auto", 
        backgroundColor: "white", 
        borderRadius: "8px", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "25px"
      }}>
        <h1 style={{ 
          fontSize: "28px", 
          marginBottom: "25px", 
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "15px"
        }}>
          Dashboard
        </h1>
        
        {session?.user ? (
          <div style={{ marginBottom: "30px" }}>
            <div style={{ 
              display: "flex", 
              marginBottom: "12px",
              alignItems: "center"
            }}>
              <span style={{ 
                fontWeight: "bold", 
                width: "100px" 
              }}>Username:</span>
              <span>{session.user.name || session.user.email}</span>
            </div>
            
            <div style={{ 
              display: "flex",
              alignItems: "center" 
            }}>
              <span style={{ 
                fontWeight: "bold", 
                width: "100px" 
              }}>Email:</span>
              <span>{session.user.email}</span>
            </div>
          </div>
        ) : (
          <p style={{ marginBottom: "20px" }}>User information not available</p>
        )}
        
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ 
            backgroundColor: "#ef4444", 
            color: "white", 
            border: "none", 
            padding: "10px 16px", 
            borderRadius: "4px", 
            cursor: "pointer",
            fontWeight: "500",
            display: "inline-block"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}