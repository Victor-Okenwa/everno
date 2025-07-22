import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react"; // Import HydrateClient
import { ThemeProvider } from "~/app/_providers/theme-provider";
import { AuthProvider } from "./_providers/auth-provider";
import { Toaster } from "~/components/ui/sonner";
import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Interactive Dashboard",
  description: "Visualize and interact with your own data",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <HydrateClient>
              <AuthProvider>{children}</AuthProvider>
            </HydrateClient>
          </TRPCReactProvider>
          <Toaster
            theme="light"
            richColors
            position="bottom-right"
            duration={6000}
            swipeDirections={["bottom", "right"]}
            toastOptions={{
              unstyled: false,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
