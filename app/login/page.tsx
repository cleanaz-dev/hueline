// app/login/page.tsx
import LoginClient from "@/components/ui/login/login-client";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
