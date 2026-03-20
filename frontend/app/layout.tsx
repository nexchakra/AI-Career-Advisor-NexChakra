import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using a modern, clean font
import "./globals.css"; // THIS LINE IS CRITICAL

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexChakra AI | Career Intelligence",
  description: "Advanced AI-powered career roadmap and strategy platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark"> 
      <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
        {/* We can put a global Navbar here later if we want it on every page */}
        {children}
      </body>
    </html>
  );
}