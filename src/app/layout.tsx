/* src/app/layout.tsx */

import type { Metadata } from "next";
import "./globals.css";
import { JourneyProvider } from "@/app/context/JourneyContext";
import { BrandingProvider } from "@/app/context/BrandingContext";
import { JourneyConfigProvider } from "@/app/context/JourneyConfigContext";
import { PortalProvider } from "@/app/context/PortalContext";
import { cn } from "@/lib/utils";
import { Plus_Jakarta_Sans, Manrope, Inter, Open_Sans, Poppins, Roboto } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "optional",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "optional",
});

/* Font variables for journey builder (WhitelabelModal font picker) */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "optional" });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-open-sans", display: "optional" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "optional" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto", display: "optional" });

export const metadata: Metadata = {
  title: "Mahindra Finance - Savings Account",
  description: "Streamlined account opening for salaried employees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // --- MODIFIED: Removed 'dark' class ---
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      {/* --- MODIFIED: Removed all extra classes --- */}
      <body
        className={cn(
          "h-screen overflow-hidden font-sans antialiased",
          plusJakarta.variable,
          manrope.variable,
          inter.variable,
          openSans.variable,
          poppins.variable,
          roboto.variable
        )}
      >
        <JourneyConfigProvider>
          <BrandingProvider>
            <PortalProvider>
              <JourneyProvider>
                {children}
              </JourneyProvider>
            </PortalProvider>
          </BrandingProvider>
        </JourneyConfigProvider>
      </body>
    </html>
  );
}