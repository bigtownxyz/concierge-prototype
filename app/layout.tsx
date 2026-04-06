import type { Metadata } from "next";
import { cormorant, inter, jetbrainsMono, notoSerif, manrope } from "@/lib/fonts";
import "./globals.css";
// Material Symbols Outlined - loaded via next/head equivalent (metadata link)
// injected as a <link> in the <head> via the layout JSX below

export const metadata: Metadata = {
  title: {
    default: "Concierge | Second Citizenship & Residency Advisory",
    template: "%s | Concierge",
  },
  description:
    "Connect with global citizenship and residency programs. Expert advisory for high-net-worth individuals seeking second passports, golden visas, and tax-optimised residency.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Concierge",
  },
  // TEMPORARY: Prevent indexing until we have a dedicated domain
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSerif.variable} ${manrope.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
