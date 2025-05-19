import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BasketProvider } from "@/contexts/BasketContext";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimplyTeams",
  description: "Sports facility and program management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <BasketProvider>
            <Navbar />
            {children}
          </BasketProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
