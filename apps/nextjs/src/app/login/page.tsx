"use client";

import type { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AppRouter } from "@dumbledoor/user-api";

import { api } from "~/trpc/react";

export const runtime = "nodejs";

export default function LoginPage() {
  const login = api.auth.signIn.useMutation();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [bannerMessage, setBannerMessage] = useState({ type: "", message: "" });

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setDisabled(true);

    login
      .mutateAsync({
        username,
        password,
      })
      .then((data) => {
        setBannerMessage({
          type: "success",
          message: "Successfully logged in... Redirecting to admin panel",
        });
        setDisabled(true);

        if (!data.token) throw new Error("No token received from the server");

        localStorage.setItem("token", data.token);

        setTimeout(() => {
          void router.push("/admin");
        }, 1000);
      })
      .catch((error: TRPCClientError<AppRouter>) => {
        setBannerMessage({
          type: "error",
          message: error.message,
        });
      })
      .finally(() => {
        setDisabled(false);
      });

    setPassword("");
  };

  return (
    <main className="container flex h-screen items-center justify-center py-16">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-700">
          Login
        </h1>

        {!login.isPending && bannerMessage.message && (
          <div
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              login.isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {bannerMessage.message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              name="username"
              type="text"
              disabled={disabled}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              disabled={disabled}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={disabled}
              className="hover:bg-primary-dark w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
