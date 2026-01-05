import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { PWAInstaller } from "@/components/pwa-installer"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  // Default title to prevent flashing - will be overridden by page-specific generateMetadata
  title: {
    default: "SoundBoardUnblocked - Free Meme Soundboard Unblocked",
    template: "%s | SoundBoardUnblocked",
  },
  description:
    "Discover 500,000+ free sound buttons, meme soundboards, and sound effects unblocked. Play hilarious sounds, create custom soundboards on any device.",
  generator: "soundboardunblocked",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "soundboardunblocked",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "48x48",
      },
      {
        url: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root{--background:oklch(1 0 0);--foreground:oklch(0.145 0 0);--card:oklch(1 0 0);--card-foreground:oklch(0.145 0 0);--primary:oklch(0.205 0 0);--primary-foreground:oklch(0.985 0 0);--secondary:oklch(0.97 0 0);--secondary-foreground:oklch(0.205 0 0);--muted:oklch(0.97 0 0);--muted-foreground:oklch(0.556 0 0);--border:oklch(0.922 0 0);--ring:oklch(0.708 0 0);--radius:0.625rem}
              .dark{--background:oklch(0.145 0 0);--foreground:oklch(0.985 0 0);--card:oklch(0.145 0 0);--card-foreground:oklch(0.985 0 0);--primary:oklch(0.985 0 0);--primary-foreground:oklch(0.205 0 0);--secondary:oklch(0.269 0 0);--secondary-foreground:oklch(0.985 0 0);--muted:oklch(0.269 0 0);--muted-foreground:oklch(0.708 0 0);--border:oklch(0.269 0 0);--ring:oklch(0.439 0 0)}
              *{border-color:var(--border);outline-color:var(--ring)}
              body{background-color:var(--background);color:var(--foreground);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;-webkit-font-smoothing:antialiased;font-size:14px}
              h1,h2,h3,h4,h5,h6{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif}
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/favicon.ico" as="image" />
        <link rel="preload" href="/icon-192x192.png" as="image" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://play.soundboard.cloud" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://play.soundboard.cloud" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ef4444" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="soundboardunblocked" />
      </head>
      <body className="antialiased">
        <Script strategy="lazyOnload" src="https://www.googletagmanager.com/gtag/js?id=G-9CLG9GS1LT" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9CLG9GS1LT');
          `}
        </Script>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Suspense fallback={null}>
              <FavoritesProvider>
                {children}
                <PWAInstaller />
              </FavoritesProvider>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}


