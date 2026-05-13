import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mike Padden — Practical AI tools, built for real life",
    template: "%s · Mike Padden",
  },
  description:
    "Personal AI lab from Mike Padden in Seattle — small tools for research, sports, weddings, and AI use case discovery.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "Mike Padden",
    title: "Mike Padden — Practical AI tools, built for real life",
    description:
      "Personal AI lab from Mike Padden in Seattle — small tools for research, sports, weddings, and AI use case discovery.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mike Padden — Practical AI tools, built for real life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mike Padden — Practical AI tools, built for real life",
    description:
      "Personal AI lab from Mike Padden in Seattle — small tools for research, sports, weddings, and AI use case discovery.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="paper-grain min-h-full bg-cream text-ink">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
