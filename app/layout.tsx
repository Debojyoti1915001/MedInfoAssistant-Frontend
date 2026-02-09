import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HealthCare Platform',
  description: 'Healthcare platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'Arial, sans-serif'
      }}>
        {children}
      </body>
    </html>
  )
}
