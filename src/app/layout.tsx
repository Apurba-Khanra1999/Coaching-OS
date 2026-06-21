import type { Metadata } from 'next';
import './globals.css';
import RootLayoutWrapper from '@/components/root-layout-wrapper';

export const metadata: Metadata = {
  title: 'Coaching OS | Professional Education Management Platform',
  description: 'Manage students, attendance, fees, batches, parent communication, and teacher payroll from one unified platform. Reclaim administrative time and stop revenue leakage with Coaching OS.',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Coaching OS | Professional Education Management Platform',
    description: 'Manage students, attendance, fees, batches, parent communication, and teacher payroll from one unified platform.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Coaching OS logo',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Coaching OS | Professional Education Management Platform',
    description: 'Manage students, attendance, fees, batches, parent communication, and teacher payroll from one unified platform.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20">
        <RootLayoutWrapper>
          {children}
        </RootLayoutWrapper>
      </body>
    </html>
  );
}

