import { TailwindIndicator } from "@/components/TailwindIndicator";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/app-providers";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-inter",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: {
    default: "Platinum",
    template: `%s | Platinum`,
  },
  description: "",
  keywords: [],
  authors: [
    {
      name: "Carlos Lopes",
      url: "https://carloslopes.vercel.app",
    },
  ],
  creator: "Carlos Lopes",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
      <head />
      <body className="min-h-screen">
        <AppProviders>
          {children}
          <TailwindIndicator />
        </AppProviders>
      </body>
    </html>
  );
}
