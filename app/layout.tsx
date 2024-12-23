import type { Metadata } from "next";
import {Plus_Jakarta_Sans} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const FontSans = Plus_Jakarta_Sans({
  subsets:["latin"],
  weight:['300','400','500','600','700'],
  variable:'--font-sans'
});

export const metadata: Metadata = {
  title: "HealthCare",
  description: "A healthcare management system",
  icons: {
    icon: ['/favicon.ico?v=4'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${FontSans.variable} antialiased min-h-screen bg-dark-300 font-sans text-white`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
