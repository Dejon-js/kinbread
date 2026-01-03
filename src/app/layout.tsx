import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacity Gate - Manage Your Bakery Bookings",
  description: "Simple capacity management for cottage bakers. Set your limits, share your link, and let the system say no for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
