import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "ApexTech | Enterprise Leave Management System",
  description: "Enterprise Leave Management System for Employees, Managers, and Administrators - ApexTech",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
