import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'PawnTech — ระบบรับจำนำมือถือ',
  description: 'ระบบรับจำนำมือถือ iOS และ Android พร้อมระบบล็อกเครื่องและรายงาน',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
