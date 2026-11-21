"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";

// Lo contrario de PrivateRoute: login y registro solo para quien NO tiene sesión
export default function GuestRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  if (status !== "unauthenticated") {
    return <LoadingState label="Verificando sesión" />;
  }

  return <>{children}</>;
}
