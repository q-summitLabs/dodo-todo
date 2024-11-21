import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Modern Todo App',
  description: 'A sleek and modern todo app built with Next.js 15',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

