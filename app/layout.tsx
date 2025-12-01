import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase:
    process.env.NEXT_PUBLIC_SITE_URL === undefined
      ? undefined
      : new URL(process.env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "ET Lab | EnerTech Lab",
    template: "%s | ET Lab",
  },
  description:
    "エネルギー×テックの最前線を「動く仕組み」から読み解くメディア。暮らしの電気代からスマホ・PC・データセンター、次世代デバイスまでを噛み砕いて届けます。",
  keywords: [
    "ET Lab",
    "EnerTech Lab",
    "エネルギー×テック",
    "AI",
    "データセンター",
    "次世代デバイス",
    "スピントロニクス",
  ],
  openGraph: {
    type: "website",
    siteName: "ET Lab | EnerTech Lab",
    title: "ET Lab | EnerTech Lab",
    description:
      "エネルギー×テックの最前線を「動く仕組み」から読み解くメディア。暮らしの電気代からスマホ・PC・データセンター、次世代デバイスまでを噛み砕いて届けます。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
