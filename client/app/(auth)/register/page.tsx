"use client";

import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();

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
        <h1 className="text-xs tracking-widest text-neon-pink">CREA TU CUENTA</h1>
        <p className="mt-2 text-sm text-arena-muted">
          Únete a la arena: vota o pon a competir tu arte
        </p>
      </header>

      <AuthForm mode="register" onSubmit={register} />

      <p className="text-sm text-arena-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-neon-cyan underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
