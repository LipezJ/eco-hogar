import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider"
import ScrollToTop from "@/components/layout/scroll-top";
import { TanstackProvider } from "@/components/tanstack-provider";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoHogar - Gestiona tus finanzas personales con inteligencia",
  description: "Toma el control total de tu dinero con EcoHogar. Organiza ingresos, gastos, deudas, inversiones y cuentas bancarias en un solo lugar. Plataforma completa de gestión financiera personal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TanstackProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ScrollToTop />
            </ThemeProvider>
          </TanstackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
