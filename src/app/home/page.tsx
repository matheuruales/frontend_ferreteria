import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomePromoBanners from "@/components/home/HomePromoBanners";
import HomeFooter from "@/components/home/HomeFooter";
import type { HomeData } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Multivariedades — Ferretería Online",
  description:
    "Encuentra herramientas, materiales y todo para tus proyectos en Multivariedades, tu ferretería online de confianza.",
};

async function getHomeData(): Promise<HomeData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/api/v1/catalog/home`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<HomeData>;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const homeData = await getHomeData();
  const featuredCategories = homeData?.featured_categories ?? [];
  const featuredProducts = homeData?.featured_products ?? [];

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <HeroSection />
      <FeaturedCategories categories={featuredCategories} />
      <FeaturedProducts products={featuredProducts} />
      <HomePromoBanners />
      <HomeFooter />
    </main>
  );
}
