import { Toaster } from "sonner";
import "./globals.scss";
import { Providers } from "../client/QueryClient";
import { ThemeProvider } from "../theme/ThemeProvider";

export const metadata = {
  title: "Sunridge Academy",
  description: "School dashboard for Sunridge Academy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Toaster richColors={true} />
      </body>
    </html>
  );
}
