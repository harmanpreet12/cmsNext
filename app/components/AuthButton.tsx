"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button className="text-white bg-red-500 cursor-pointer px-4 py-2 mt-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 transition duration-150 ease-in-out" onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      <p className="text-black">Not signed in</p> <br />
      <button className="text-black cursor-pointer" onClick={() => signIn()}>Sign in</button>
    </>
  );
}
