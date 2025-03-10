import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Next.js Authentication with Strapi',
  description: 'A simple authentication app using Next.js and Strapi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}