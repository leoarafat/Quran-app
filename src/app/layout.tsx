import type { Metadata, Viewport } from "next";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "@fontsource/amiri-quran/400.css";
import "@fontsource/noto-serif-bengali/400.css";
import "@fontsource/noto-serif-bengali/500.css";
import "@fontsource/noto-serif-bengali/600.css";
import "@fontsource/noto-serif-bengali/700.css";
import "@fontsource/tiro-bangla/400.css";
import "./globals.css";
import { AppNav } from "@/components/AppNav";
import { PwaManager } from "@/components/offline/PwaManager";
import { MiniPlayer } from "@/components/quran/MiniPlayer";
import { ReminderRunner } from "@/components/tools/ReminderRunner";
import { SettingsBootScript } from "@/components/SettingsBootScript";

export const metadata: Metadata = {
  title: { default: "নূর কুরআন: বাংলা কুরআন ও দৈনিক আমল", template: "%s · নূর কুরআন" },
  description: "বাংলা কুরআন, উচ্চারণ, তিলাওয়াত, হাদিস, দোয়া ও নামাজের সময়।",
  appleWebApp: { capable: true, title: "নূর কুরআন", statusBarStyle: "black-translucent" },
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
        <div aria-hidden className="status-bar" />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-[calc(0.5rem+var(--safe-top))] focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">
          মূল অংশে যান
        </a>
        <div className="lg:pl-56">
          <main id="main" className="mx-auto max-w-5xl px-[1.375rem] pb-32 pt-[calc(1.5rem+var(--safe-top))] lg:px-8 lg:pb-10">
            {children}
          </main>
          <MiniPlayer />
        </div>
        <AppNav />
        <PwaManager />
        <ReminderRunner />
      </body>
    </html>
  );
}
