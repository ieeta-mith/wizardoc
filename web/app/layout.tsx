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
            <div className="flex-1 flex flex-col">
              <Navigation />
            <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
