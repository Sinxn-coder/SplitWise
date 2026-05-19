import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ViewportFix } from '@/components/viewport-fix'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans'
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'HomiePay - Split Expenses with Friends',
  description: 'A modern expense splitting app to split bills between friends easily',
  generator: 'HomiePay PWA',
  manifest: 'manifest.json',
  // iOS requires apple-touch-icon explicitly here - without this iPhone shows a generic letter icon
  icons: {
    icon: [
      { url: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: 'icon-dark-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: 'icon-512x512.png',
    // This is the key one for iPhone home screen icon
    apple: [
      { url: 'apple-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  // iPhone PWA meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HomiePay',
    startupImage: 'apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d9488' },
    { media: '(prefers-color-scheme: dark)', color: '#14b8a6' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        {/* Explicit apple-touch-icon and manifest tags for bulletproof PWA installations */}
        <link rel="apple-touch-icon" href="apple-icon.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="apple-icon.png" />
        <link rel="manifest" href="manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HomiePay" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ViewportFix />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
