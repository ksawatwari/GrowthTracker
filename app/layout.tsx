import type {Metadata} from 'next';
import { Kanit } from 'next/font/google';
import './globals.css'; // Global styles

const kanit = Kanit({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'thai'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'Nostalgic Growth Tracker',
  description: 'Nature-inspired personal growth tracker',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${kanit.variable} font-sans`}>
      <body className="antialiased font-sans bg-gray-900 text-gray-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
