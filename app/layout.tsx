import './globals.css'
import { Inter } from 'next/font/google'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Subtunes',
  description: 'too small to enjoy alone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="no-scrollbar">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <AppRouterCacheProvider>
        <body className={inter.className}>{children}</body>
      </AppRouterCacheProvider>
    </html>
  )
}
