import type { Metadata } from "next";
import { Toaster } from "sonner";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthcare Hustlers - Invoice Portal",
  description:
    "Generate official payment receipts for Healthcare Hustlers training programmes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
          <div className="mx-auto max-w-7xl px-4">
            <p className="mb-2 font-semibold text-brand-dark">
              Healthcare Hustlers
            </p>
            <p>
              Email: info@healthcarehustlers.org | Phone: +92 335 0340888
            </p>
            <p>www.healthcarehustlers.org</p>
            <p className="mt-2 text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Healthcare Hustlers. All rights
              reserved.
            </p>
          </div>
        </footer>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
        <WhatsAppWidget />
      </body>
    </html>
  );
}