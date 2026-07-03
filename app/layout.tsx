import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Healthcare Hustlers — Invoice Portal',
  description: 'Official payment receipting and invoice portal for Healthcare Hustlers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}