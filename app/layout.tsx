import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebNova - Criação de Sites Premium",
  description: "Transforme sua presença digital com sites de alta performance.",
  verification: {
    // 💡 A chave 'google' aceita o token de verificação como string.
    // O Next.js irá renderizar isso como: <meta name="google-site-verification" content="..." />
    google: "0KG0zKsqFRDAImaL87ddciTf_RINgkewzJWB3B5W0V0", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-dark-950 text-slate-50 antialiased selection:bg-brand-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}