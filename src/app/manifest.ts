import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "নূর কুরআন: বাংলা কুরআন, হাদিস ও দোয়া",
    short_name: "নূর কুরআন",
    description: "বাংলা কুরআন, উচ্চারণ, তিলাওয়াত, হাদিস, দোয়া ও নামাজের সময়।",
    lang: "bn",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    // The system draws the splash screen from this colour and the icon.
    background_color: "#0a1511",
    theme_color: "#06130e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "কুরআন", url: "/quran/" },
      { name: "দোয়া ও যিকির", url: "/amal/" },
      { name: "তাসবিহ", url: "/tasbih/" },
    ],
  };
}
