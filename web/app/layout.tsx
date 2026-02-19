import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Document Tool - Medical Studies",
  description: "Tool for creating risk assessment documents for observational medical studies",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
