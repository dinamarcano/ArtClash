import GuestRoute from "@/components/GuestRoute";

// Login y registro: si ya hay sesión, se redirige al inicio
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestRoute>{children}</GuestRoute>;
}
