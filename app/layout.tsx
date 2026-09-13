import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RidwanAI — Voice Generator",
  description: "Cartesia Sonic TTS voice generator",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
