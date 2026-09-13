import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteShell } from "@/components/site/site-shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://allisonglobal.example";
const description =
  "Allison Global is a Nigerian technology and security solutions partner delivering ICT, networking, cybersecurity, CCTV surveillance, access control, fire safety and IT infrastructure — engineered to protect homes, businesses and institutions.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Allison Global — ICT, Networking, Cybersecurity & Electronic Security Solutions",
    template: "%s | Allison Global",
  },
  description,
  keywords: [
    "ICT solutions Nigeria",
    "networking company",
    "cybersecurity Nigeria",
    "CCTV installation",
    "access control systems",
    "fire alarm systems",
    "structured cabling",
    "IT infrastructure",
    "Allison Global",
    "security solutions partner",
    "Agu Chisom Alvin",
  ],
  authors: [{ name: "Allison Global", url: siteUrl }],
  creator: "Allison Global",
  publisher: "Allison Global",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Allison Global — Engineering Trust. Securing Futures.",
    description,
    url: siteUrl,
    siteName: "Allison Global",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allison Global — ICT, Networking, Cybersecurity & Electronic Security",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/logo.svg",
  },
  category: "technology",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b3d39" },
    { media: "(prefers-color-scheme: dark)", color: "#0b2a27" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
