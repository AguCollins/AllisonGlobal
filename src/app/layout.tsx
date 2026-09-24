import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteShell } from "@/components/site/site-shell";
import { AuthSessionProvider } from "@/components/site/session-provider";
import { company } from "@/lib/data/company";

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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.allisonglobal.tech";
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
    title: "Allison Global — Technology without limits",
    description,
    url: siteUrl,
    siteName: "Allison Global",
    type: "website",
    locale: "en_NG",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Allison Global Ltd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allison Global — Technology without limits",
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.png",
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
  // LocalBusiness / Organization structured data for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.legalName,
    alternateName: company.name,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.png`,
    description: company.shortPitch,
    telephone: company.contact.phoneIntl,
    email: company.contact.email,
    areaServed: "Nigeria",
    address: {
      "@type": "PostalAddress",
      addressLocality: company.location.city,
      addressCountry: company.location.country,
    },
    foundingDate: "2025-10",
    founder: {
      "@type": "Person",
      name: company.founder.name,
      jobTitle: company.founder.title,
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <SiteShell>{children}</SiteShell>
          </AuthSessionProvider>
          <SonnerToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
