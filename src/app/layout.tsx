import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "BeeHive - Dashboard de Productividad",
    template: "%s | BeeHive",
  },
  description:
    "Organiza tus tareas con BeeHive Productivity — Pomodoro, Kanban y gamificación con temática de abeja.",
  applicationName: "BeeHive",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    title: "BeeHive - Dashboard de Productividad",
    description: "Organiza tus tareas con BeeHive Productivity — Pomodoro, Kanban y gamificación.",
    url: siteUrl,
    siteName: "BeeHive",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "BeeHive — Productivity Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeeHive - Dashboard de Productividad",
    description: "Pomodoro, Kanban y gamificación con temática de abeja.",
    images: [`${siteUrl}/og-image.svg`],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? "";

  return (
    <html lang="es" nonce={nonce}>
      <head>
        <meta name="theme-color" content="#e28800" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-[#faf6ee] text-[#100f0d] antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#e28800] focus:text-white focus:rounded-xl focus:font-bold focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
