import Link from "next/link";

interface CheckoutMiniHeaderProps {
  secureText: string;
}

export default function CheckoutMiniHeader({ secureText }: CheckoutMiniHeaderProps) {
  return (
    <header className="bg-[#1e3a5f] px-4 py-3 sm:px-6">
      <div className="home-shell flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-extrabold text-white">
          Multi<span className="text-[#f57c00]">variedades</span>
        </Link>
        <span className="text-xs text-white/70">{secureText}</span>
      </div>
    </header>
  );
}
