"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

const HIDDEN_PREFIXES = [
  "/admin",
  "/login",
  "/registro",
  "/recuperar-contrasena",
  "/verificar",
  "/catalogo",
  "/carrito",
  "/checkout",
  "/cuenta",
];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const path = pathname ?? "/";

  const hidden = HIDDEN_PREFIXES.some((prefix) =>
    path === prefix || path.startsWith(`${prefix}/`)
  );

  if (hidden) return null;
  return <Navbar />;
}
