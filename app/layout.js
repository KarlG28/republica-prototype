import Script from "next/script";

export const metadata = {
  title: "Republica · Prototype",
  description: "Cent jours pour gouverner.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <Script
          defer
          src="https://plausible.io/js/pa-Qw97HlSXC0TrqV6X7TT3Z.js"
          strategy="beforeInteractive"
        />
        <Script id="plausible-init" strategy="beforeInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
