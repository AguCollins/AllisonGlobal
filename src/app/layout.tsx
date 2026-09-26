import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteShell } from "@/components/site/site-shell";
import { AuthSessionProvider } from "@/components/site/session-provider";
import { getCompany, type CompanyInfo } from "@/lib/data-access";

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
const defaultDescription =
  "Allison Global is a Nigerian technology and security solutions partner delivering ICT, networking, cybersecurity, CCTV surveillance, access control, fire safety and IT infrastructure — engineered to protect homes, businesses and institutions.";

const FALLBACK_COMPANY: CompanyInfo = {
  name: "Allison Global",
  legalName: "Allison Global Ltd",
  tagline: "Technology without limits.",
  descriptor: "ICT, Networking, Cybersecurity & Electronic Security Solutions",
  foundedYear: "2025",
  foundedLabel: "Established October 2025",
  rcNumber: "RC: 8939118",
  shortPitch: defaultDescription,
  longPitch: defaultDescription,
  location: { city: "Lagos", country: "Nigeria", coverage: "", addressLine: "Lagos, Nigeria" },
  contact: {
    phone: "09152158801", phoneDisplay: "+234 915 215 8801", phoneIntl: "+2349152158801",
    email: "hello@allisonglobal.tech", salesEmail: "sales@allisonglobal.tech",
    supportEmail: "support@allisonglobal.tech", whatsapp: "2349152158801",
    hours: "Mon–Sat: 8:00am – 6:00pm · Emergency support 24/7",
  },
  social: { linkedin: "#", facebook: "#", instagram: "#", x: "#" },
  founder: {
    name: "Agu Chisom Alvin",
    title: "Founder & Chief Executive Officer",
    discipline: "Electrical & Electronics Engineer",
    bio: "Agu Chisom Alvin is an Electrical & Electronics Engineer who founded Allison Global Ltd in October 2025.",
    phone: "09152158801",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Allison Global — ICT, Networking, Cybersecurity & Electronic Security Solutions",
    template: "%s | Allison Global",
  },
  description: defaultDescription,
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
    description: defaultDescription,
    url: siteUrl,
    siteName: "Allison Global",
    type: "website",
    locale: "en_NG",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Allison Global Ltd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allison Global — Technology without limits",
    description: defaultDescription,
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

// Force dynamic so company info is always fresh from DB
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch company info from DB for JSON-LD structured data.
  // Falls back to hardcoded defaults only if DB is unreachable (so the page
  // still renders — but the SEO schema will match editable values when DB is up).
  let company: CompanyInfo = FALLBACK_COMPANY;
  try {
    company = await getCompany();
  } catch {
    // DB unavailable — use fallback for SEO schema only; pages will render
    // their own error states where content is required.
  }

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
