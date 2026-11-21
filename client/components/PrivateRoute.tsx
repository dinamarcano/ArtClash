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
  // Opcional: exige además un rol (por ejemplo, solo artistas)
  role?: UserRole;
}

// Solo muestra su contenido si hay sesión; si no, manda al login
export default function PrivateRoute({ children, role }: PrivateRouteProps) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Mientras se revisa la sesión (o justo antes de redirigir) no se muestra
  // la pantalla privada, ni por un instante
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
