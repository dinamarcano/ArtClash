import PrivateRoute from "@/components/PrivateRoute";

// Todas las pantallas dentro de (private) exigen sesión.
// Los paréntesis hacen que "(private)" no aparezca en la URL.
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
