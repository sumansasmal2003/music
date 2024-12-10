import "./globals.css";
import React from "react";

export const metadata = {
  title: "MusicVerse",
  description: "Discover and stream your favorite music",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-secondary text-white">{children}</body>
    </html>
  );
}
