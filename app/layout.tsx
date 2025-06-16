import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "0scope - Cross-Chain Analytics",
  description: "0scope: Decentralized cross-chain analytical platform powered by 0G Labs",
  icons: {
    icon: [
      {
        url: "/images/0scope-logo-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/0scope-logo-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/images/0scope-logo-light.png",
  },
  openGraph: {
    title: "0scope - Cross-Chain Analytics",
    description: "Decentralized cross-chain analytical platform powered by 0G Labs",
    images: [
      {
        url: "/images/0scope-logo-light.png",
        width: 1200,
        height: 630,
        alt: "0scope Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "0scope - Cross-Chain Analytics",
    description: "Decentralized cross-chain analytical platform powered by 0G Labs",
    images: ["/images/0scope-logo-light.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/0scope-logo-light.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/0scope-logo-light.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
