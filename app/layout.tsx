import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Temi | Build. Showcase. Get Discovered.",
  description: "The platform where Africa's brightest students become visible, connected, and hireable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body 
        className={`${inter.className} min-h-full flex flex-col antialiased`} 
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}