"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import Image from "next/image";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrors({});
    setIsLoading(true);

    // Validate with Zod
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof LoginFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const signInResult = await signIn("admin", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (signInResult?.ok) {
        router.push("/form");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
      <Image src={Logo} width={125} height={125} alt="Logo" priority />
      <form
        onSubmit={handleLogin}
        className="p-8 bg-white shadow-lg rounded-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Admin Login
        </h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white p-2.5 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
