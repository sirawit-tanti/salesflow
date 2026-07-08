import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@salesflow.test");
  const [password, setPassword] = useState("password");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">SalesFlow</h1>
          <p className="mt-2 text-sm text-slate-500">
            Login to manage quotations, invoices, and payments.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={async (event) => {
            event.preventDefault();

            setErrorMessage("");
            setIsSubmitting(true);

            try {
              await login({
                email,
                password,
              });

              navigate("/dashboard");
            } catch (error) {
              if (axios.isAxiosError(error)) {
                setErrorMessage(
                  error.response?.data?.message ??
                    "Login failed. Please try again.",
                );
              } else {
                setErrorMessage("Login failed. Please try again.");
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="admin@salesflow.test"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
              placeholder="password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Demo Accounts</p>

          <div className="mt-3 space-y-2 text-xs text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Admin:</span>{" "}
              admin@salesflow.test / password
            </p>
            <p>
              <span className="font-medium text-slate-900">Sales:</span>{" "}
              sales@salesflow.test / password
            </p>
            <p>
              <span className="font-medium text-slate-900">Accountant:</span>{" "}
              accountant@salesflow.test / password
            </p>
            <p>
              <span className="font-medium text-slate-900">Manager:</span>{" "}
              manager@salesflow.test / password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
