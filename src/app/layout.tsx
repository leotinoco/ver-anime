import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Wait, Next.js handles Google fonts natively but requires installation, wait, create-next-app already provides them
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anime Fan | Disfruta del mejor Anime Online",
  description: "Plataforma premium para ver tus animes favoritos con una experiencia al estilo Netflix. ¡Gratis y en alta resolución!",
  icons: {
    icon: "/anime-fan-250x250.avif",
    apple: "/anime-fan-250x250.avif",
    shortcut: "/anime-fan-250x250.avif",
  },
  openGraph: {
    title: "Anime Fan",
    description: "Ver anime online en alta calidad con una interfaz moderna y fluida.",
    images: [{ url: "/miniatura-1200.avif", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Fan",
    description: "La mejor experiencia para ver anime online.",
    images: ["/miniatura-1200.avif"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-white overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full flex flex-col min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
