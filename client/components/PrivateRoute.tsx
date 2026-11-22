"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/users";

interface PrivateRouteProps {
  children: ReactNode;
  role?: UserRole;
}

export default function PrivateRoute({ children, role }: PrivateRouteProps) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return <LoadingState label="Verificando sesión" />;
  }

  if (role && user.role !== role) {
    return (
      <main className="mx-auto max-w-md px-4 pt-6">
        <EmptyState
          tone="error"
          title="Sin acceso"
          message="Esta sección es solo para artistas"
          action={
            <Link href="/" className="text-sm text-neon-cyan underline">
              Volver al inicio
            </Link>
          }
        />
      </main>
    );
  }

  return <>{children}</>;
}
