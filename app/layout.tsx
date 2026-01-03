import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capacity Gate",
  description: "Manage your bakery capacity and bookings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
