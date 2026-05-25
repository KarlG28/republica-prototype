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
          async
          src="https://plausible.io/js/pa-Qw97HlSXC0TrqV6X7TT3Z.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() {
              (window.plausible.q = window.plausible.q || []).push(arguments)
            };
            window.plausible.init = window.plausible.init || function(i) {
              window.plausible.o = i || {}
            };
            window.plausible.init();
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
