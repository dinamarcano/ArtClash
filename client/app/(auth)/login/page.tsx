"use client";

import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-8 px-6 py-10">
      <Image
        src="/logo.png"
        alt="ArtClash"
        width={160}
        height={40}
        priority
        className="h-auto w-40"
      />

      <header className="w-full text-center">
        <h1 className="text-xs tracking-widest text-neon-cyan">INICIA SESIÓN</h1>
        <p className="mt-2 text-sm text-arena-muted">
          Entra para votar por tus artistas favoritos
        </p>
      </header>

      <AuthForm
        mode="login"
        onSubmit={({ email, password }) => login({ email, password })}
      />

      <p className="text-sm text-arena-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-neon-cyan underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
