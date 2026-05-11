import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";

export const metadata: Metadata = {
  title: "MC Kurd Shop - Premium Minecraft Content",
  description:
    "The best place to buy Minecraft shaders, modpacks, skins, and plugins at affordable prices.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      dir={locale === "ku" ? "rtl" : "ltr"}
      className="h-full bg-background antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
