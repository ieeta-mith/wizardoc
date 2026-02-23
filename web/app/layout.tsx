import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import SidebarWrapper from '@/components/SidebarWrapper';

export const metadata: Metadata = {
  title: "WizarDoc - Project Document Builder",
  description: "Build questionnaire-driven documents using reusable templates and project context",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
            <SidebarWrapper />
            <div className="flex min-w-0 flex-1 flex-col">
              <Navigation />
            <main className="container mx-auto flex-1 min-w-0 px-4 py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
