import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Undercover Online | Game Deteksi Kata Terseru",
  description: "Gabung ke pesta paling seru online! Main Undercover Online bareng teman. Game deteksi kata real-time dengan gaya neobrutalis yang keren.",
  icons: {
      icon: [
        { url: "/favicon-512.png", sizes: "any" }
      ],
    },
    openGraph: {
      title: "Undercover Online | Game Deteksi Kata Terseru",
      description: "Gabung ke pesta paling seru online! Main Undercover Online bareng teman. Game deteksi kata real-time dengan gaya neobrutalis yang keren.",
      images: ["https://undercover.coreapps.web.id/og-image.jpeg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Undercover Online | Game Deteksi Kata Terseru",
      description: "Gabung ke pesta paling seru online! Main Undercover Online bareng teman. Game deteksi kata real-time dengan gaya neobrutalis yang keren.",
      images: ["https://undercover.coreapps.web.id/og-image.jpeg"],
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
