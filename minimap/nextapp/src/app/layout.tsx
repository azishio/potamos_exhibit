import type { Metadata } from "next";
import Provider from "@/app/Provider";
import { ReactNode } from "react";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head />
      <body>
        <div style={{ background: "rgb(47,85,151)" }}>
          <Provider>{children}</Provider>
        </div>
      </body>
    </html>
  );
}
