import { Inter } from 'next/font/google'
import './global.css' // This line "links" the paint to the skeleton

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Civiq | Real-Time Dashboard',
  description: 'Crowd management made simple.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}