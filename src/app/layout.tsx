import type { Metadata } from 'next'
import { Barlow_Condensed, Karla } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { SiteChrome } from '@/components/layout/SiteChrome'
import './globals.css'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const body = Karla({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'ECO · Multi-platform content',
  description: 'One theme echoed across Twitter, LinkedIn, Instagram and blog.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('eco-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {/* ECO: four press plates. Black, burnt orange, amber. One theme, four voices. */}
        <Providers>
          <div className="sky" aria-hidden>
            <span className="ember e1" />
            <span className="ember e2" />
          </div>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
