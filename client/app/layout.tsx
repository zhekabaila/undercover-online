import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Party Crashers | The Ultimate Social Deduction Game",
  description: "Join the most chaotic party online! Play Party Crashers with your friends. Real-time word deduction game with a vibrant neobrutalist vibe.",
  icons: {
      icon: [
        { url: "/favicon-512.png", sizes: "any" }
      ],
    },
    openGraph: {
      title: "Party Crashers | The Ultimate Social Deduction Game",
      description: "Join the most chaotic party online! Play Party Crashers with your friends. Real-time word deduction game with a vibrant neobrutalist vibe.",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Party Crashers | The Ultimate Social Deduction Game",
      description: "Join the most chaotic party online! Play Party Crashers with your friends. Real-time word deduction game with a vibrant neobrutalist vibe.",
      images: ["/og-image.png"],
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
