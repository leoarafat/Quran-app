import type { Metadata, Viewport } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "@fontsource/amiri-quran/400.css";
import "@fontsource/noto-serif-bengali/500.css";
import "@fontsource/noto-serif-bengali/600.css";
import "@fontsource/noto-serif-bengali/700.css";
import "@fontsource/tiro-bangla/400.css";
import "./globals.css";
import { AppNav } from "@/components/AppNav";
import { MiniPlayer } from "@/components/quran/MiniPlayer";
import { SettingsBootScript } from "@/components/SettingsBootScript";

export const metadata: Metadata = {
  title: { default: "নূর কুরআন: বাংলা কুরআন ও দৈনিক আমল", template: "%s · নূর কুরআন" },
  description: "বাংলা কুরআন, অনুবাদ, তিলাওয়াত, দৈনিক আমল ও নামাজ শিক্ষা।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06130e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <SettingsBootScript />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">
          মূল অংশে যান
        </a>
        <div className="lg:pl-56">
          <main id="main" className="mx-auto max-w-5xl px-[1.375rem] pb-32 pt-6 lg:px-8 lg:pb-10">
            {children}
          </main>
          <MiniPlayer />
        </div>
        <AppNav />
      </body>
    </html>
  );
}
