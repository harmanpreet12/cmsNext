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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {session?.user && (
          <div className="mb-6">
            <p className="mb-2">
              <span className="font-semibold">Username:</span> {session.user.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {session.user.email}
            </p>
          </div>
        )}
        
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}