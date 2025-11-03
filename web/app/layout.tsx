import './globals.css';
import type { Metadata } from 'next';
import { tokensToCssVars, type Tokens, applyOverridesToVars } from '../lib/theme';
import Script from 'next/script';
import defaultTokens from '../tokens/default.json';
import { Space_Grotesk } from 'next/font/google';
import { getSiteSettings } from '../lib/cms';

export const metadata: Metadata = {
  title: {
    default: 'LYR.io — Sistemas Inteligentes',
    template: '%s · LYR.io'
  },
  description: 'IA, Blockchain y Automatización convergen en soluciones escalables y seguras.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'LYR.io — Sistemas Inteligentes',
    description:
      'IA, Blockchain y Automatización convergen en soluciones escalables y seguras.',
    url: '/',
    siteName: 'LYR.io',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LYR.io — Sistemas Inteligentes',
    description:
      'IA, Blockchain y Automatización convergen en soluciones escalables y seguras.'
  },
  alternates: {
    canonical: '/',
    languages: { es: '/', en: '/en' }
  }
};

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const baseVars = tokensToCssVars(defaultTokens as Tokens);
  const settings = await getSiteSettings();
  const cssVars = applyOverridesToVars(baseVars, {
    siteName: settings?.siteName,
    primaryColor: settings?.primaryColor || undefined,
    secondaryColor: settings?.secondaryColor || undefined
  });
  return (
    <html lang="es" style={cssVars} className={spaceGrotesk.variable}>
      <body>
        {process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ? (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
