import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/app/components/Providers'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Company Assets Management System',
  description: 'Manage and track company assets efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
} 