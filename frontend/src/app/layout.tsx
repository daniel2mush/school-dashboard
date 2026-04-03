import "./globals.scss";
import { AuthProvider } from "../providers/AuthProvider";
import { SchoolDataProvider } from "../providers/SchoolDataProvider";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <SchoolDataProvider>{children}</SchoolDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
