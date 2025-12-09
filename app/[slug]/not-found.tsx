import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  // Optional: Try to get the host to make it feel personal
  // Note: headers() is read-only
  const headersList = await headers();
  const host = headersList.get("host") || "hueline.com";
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="space-y-6">
        {/* Icon / Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-10 w-10 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Page not found
          </h1>
          <p className="text-lg text-gray-500">
            Sorry, we couldn&pos;t find the page you&pos;re looking for on <span className="font-semibold text-gray-700">{host}</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {/* If you have a way to know if they are a customer, you could conditionally link to /login or a generic home */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700"
            >
              Go to Login
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-gray-400">
        Powered by Hueline
      </div>
    </div>
  );
}