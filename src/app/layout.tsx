import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitoring proyek",
  description: "Papan progres pengembangan dan pengujian proyek.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      {/* Ekstensi browser dapat menyisipkan atribut body sebelum hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
