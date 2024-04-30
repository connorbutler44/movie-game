import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WHOdle",
  description:
    "Daily movie guessing game. Can you get from one movie to another with the most obscure connections?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="h-16 py-2 px-4 bg-emerald-600">
          <a href="/">
            <img className="h-full" src="/whodle.png" alt="whodle" />
          </a>
        </nav>
        {children}
      </body>
    </html>
  );
}
