import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import Script from "next/script";
import EclAutoInit from "./_components/EclAutoInit";
import NextTopLoader from "nextjs-toploader";
import EgdcLayout from "./case-studies/_components/EgdcLayout";

export const dynamic = "force-dynamic";

const moontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EGDC - Repository",
  description:
    "Discover relevant case studies as sources of inspiration, points of comparison, or benchmarks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${moontserrat.variable} ${lora.variable} antialiased no-js min-h-screen`}
    >
      <head>
        <link rel="stylesheet" href="/ecl/styles/optional/ecl-reset.css" />
        <link rel="stylesheet" href="/ecl/styles/optional/ecl-ec-default.css" />
        <link
          rel="stylesheet"
          href="/ecl/styles/optional/ecl-ec-utilities.css"
        />
        <link rel="stylesheet" href="/ecl/styles/ecl-ec.css" />
        <link rel="stylesheet" href="/ecl/styles/ecl-ec-color-modes.css" />
        <link rel="stylesheet" href="/css/overrides.css" />
      </head>
      <body className="min-h-screen ecl-color-mode--accent">
        <EgdcLayout />
        <div id="app-root">
          <NextTopLoader color="#366340" />
          {children}
        </div>
        <Script
          type="module"
          src="https://cdn.jsdelivr.net/npm/@duetds/date-picker@1.4.0/dist/duet/duet.esm.js"
          strategy="afterInteractive"
        />
        <Script
          noModule
          src="https://cdn.jsdelivr.net/npm/@duetds/date-picker@1.4.0/dist/duet/duet.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://webtools.europa.eu/load.js"
          strategy="afterInteractive"
        />
        <EclAutoInit rootId="app-root" />
      </body>
    </html>
  );
}
