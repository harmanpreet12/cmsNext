"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import styles from "./AuthForm.module.css";

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
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
        const res = await axios.post(`${strapiUrl}/api/auth/local/register`, {
          username: username || email,
          email,
          password,
        });

        if (res.data?.jwt) {
          setMessage("User registered successfully! Please sign in.");
          setIsSignUp(false);
        }
      } else {
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
    } catch (error) {
      console.error("Auth error:", error);

      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setMessage(error.response.data.error.message);
      } else {
        setMessage(isSignUp ? "Registration failed" : "Sign in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>{isSignUp ? "Sign Up" : "Sign In"}</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            {isSignUp && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Username (optional)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.toggleLink}>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className={styles.toggleButton}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}