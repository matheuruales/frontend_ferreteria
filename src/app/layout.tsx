import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Montserrat } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import CartDrawer from "@/components/cart/CartDrawer";
import "./globals.css";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

// ---------------------------------------------------------------------------
// Metadata — base SEO (Principle I: SEO-first)
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: "Multivariedades — Ferretería Online",
    template: "%s | Multivariedades",
  },
  description:
    "Encuentra herramientas, materiales y todo para tus proyectos en Multivariedades, tu ferretería online de confianza.",
  keywords: ["ferretería", "herramientas", "materiales", "construcción", "Colombia"],
  authors: [{ name: "Multivariedades" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Multivariedades",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316", // primary-500
};

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${inter.variable} ${montserrat.variable} ${geistMono.variable} h-full bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <ConditionalNavbar />
            <CartDrawer />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
