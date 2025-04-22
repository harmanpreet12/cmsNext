"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        // Sign-up logic
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`,
          {
            username: username || email,
            email: email,
            password: password,
          }
        );

        if (res.data && res.data.jwt) {
          setMessage("User registered successfully! Please sign in.");
          setMessageType("success");
          setIsSignUp(false);
        }
      } else {
        // Sign-in logic
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setMessage(res.error);
          setMessageType("error");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
      
      if (typeof error === 'object' && error && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        if (axiosError.response?.data?.error?.message) {
          setMessage(axiosError.response.data.error.message);
        } else {
          setMessage(isSignUp ? "Registration failed" : "Sign in failed");
        }
      } else if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(isSignUp ? "Registration failed" : "Sign in failed");
      }
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "420px", 
      margin: "40px auto", 
      padding: "25px 30px", 
      backgroundColor: "white", 
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)" 
    }}>
      <h1 style={{ 
        fontSize: "24px", 
        marginBottom: "12px", 
        textAlign: "center",
        fontWeight: "600",
        color: "#111827"
      }}>
        {isSignUp ? "Create an Account" : "Welcome Back"}
      </h1>
      
      <p style={{ 
        marginBottom: "20px", 
        textAlign: "center", 
        color: "#6B7280",
        fontSize: "14px"
      }}>
        {isSignUp ? "Fill in your details to get started" : "Enter your credentials to access your account"}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "normal",
            color: "#374151"
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: "94%", 
              padding: "8px 10px", 
              border: "1px solid #E5E7EB", 
              borderRadius: "6px",
              fontSize: "14px",
              height: "36px",
              outline: "none",
              backgroundColor: "#EFF6FF"
            }}
          />
        </div>
        
        {isSignUp && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "normal",
              color: "#374151"
            }}>
              Username <span style={{ color: "#9CA3AF" }}>(optional)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                width: "94%", 
                padding: "8px 10px", 
                border: "1px solid #E5E7EB", 
                borderRadius: "6px",
                fontSize: "14px",
                height: "36px",
                outline: "none",
                backgroundColor: "white"
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "normal",
            color: "#374151"
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: "94%", 
              padding: "8px 10px", 
              border: "1px solid #E5E7EB", 
              borderRadius: "6px",
              fontSize: "14px",
              height: "36px",
              outline: "none",
              backgroundColor: "#EFF6FF"
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            width: "100%", 
            padding: "8px 10px", 
            backgroundColor: "#3B82F6", 
            color: "white", 
            border: "none", 
            borderRadius: "6px", 
            cursor: isLoading ? "wait" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
            height: "36px",
            marginTop: "5px"
          }}
        >
          {isLoading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: "16px", 
          padding: "10px", 
          backgroundColor: messageType === "error" ? "#FEF2F2" : "#F0FDF4", 
          borderRadius: "6px", 
          color: messageType === "error" ? "#991B1B" : "#166534",
          fontSize: "13px"
        }}>
          {message}
        </div>
      )}
      
      <div style={{ 
        marginTop: "16px", 
        textAlign: "center",
        fontSize: "14px"
      }}>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#3B82F6", 
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}