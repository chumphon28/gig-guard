import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NONG POMz',
  description: 'The Trust Layer for Peer-to-Peer Transactions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-sans text-on-background min-h-screen">
        {children}
      </body>
    </html>
  )
}
