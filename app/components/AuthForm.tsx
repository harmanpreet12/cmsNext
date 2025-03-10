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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "400px", 
      margin: "40px auto", 
      padding: "20px", 
      backgroundColor: "white", 
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        {isSignUp ? "Sign Up" : "Sign In"}
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: "100%", 
              padding: "8px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
          />
        </div>
        
        {isSignUp && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Username (optional)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "8px", 
                border: "1px solid #ccc", 
                borderRadius: "4px" 
              }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: "100%", 
              padding: "8px", 
              border: "1px solid #ccc", 
              borderRadius: "4px" 
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            width: "100%", 
            padding: "10px", 
            backgroundColor: "#3b82f6", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer" 
          }}
        >
          {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: "15px", 
          padding: "10px", 
          backgroundColor: "#f8d7da", 
          borderRadius: "4px", 
          color: "#721c24",
          textAlign: "center" 
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#3b82f6", 
            cursor: "pointer" 
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