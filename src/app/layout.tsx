import type { Metadata, Viewport } from "next";
import "@fontsource/tiro-bangla/400.css";
import "./globals.css";
import { fontVariables } from "./fonts";
import { SideBar } from "@/components/shell/SideBar";
import { TabBar } from "@/components/shell/TabBar";
import { TopBar } from "@/components/shell/TopBar";
import { IconSprite } from "@/components/ui/Icon";
import { Toaster } from "@/components/ui/Toast";
import { getIndex } from "@/lib/quran/server";
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
    <html lang="bn" data-theme="paper" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <SettingsBootScript />
        <div aria-hidden className="status-bar" />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-[calc(0.5rem+var(--safe-top))] focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">
          মূল অংশে যান
        </a>
        <IconSprite />
        <div className="md:flex">
          <SideBar />
          <div className="min-w-0 flex-1">
            <TopBar surahNames={getIndex().surahs.map((x) => x.bangla)} />
            <main id="main" className="mx-auto max-w-5xl px-4 pb-32 pt-[calc(1.5rem+var(--safe-top))] md:px-6 md:pb-16 md:pt-7 lg:max-w-[75rem] lg:px-8">
              {children}
            </main>
            <MiniPlayer />
          </div>
        </div>
        <TabBar />
        <Toaster />
        <PwaManager />
        <ReminderRunner />
      </body>
    </html>
  );
}
