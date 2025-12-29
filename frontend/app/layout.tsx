import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Building Maintenance Manager',
  description: 'AI-powered building maintenance request management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-primary-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">🏢 Building Maintenance</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Home
                </a>
                <a href="/submit" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Submit Request
                </a>
                <a href="/dashboard" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
