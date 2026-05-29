import { Cormorant_Garamond, Inter, Instrument_Serif, JetBrains_Mono, Noto_Serif, Manrope } from "next/font/google";
import localFont from "next/font/local";

// Concierge wordmark / logotype typeface. SIL OFL 1.1, Alfredo Marco Pradil.
// License + source: lib/local-fonts/GlacialIndifference-OFL.txt
export const glacialIndifference = localFont({
  src: "./local-fonts/GlacialIndifference-Regular.woff2",
  weight: "400",
  variable: "--font-glacial",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
