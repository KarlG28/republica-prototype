export const metadata = {
  title: "Republica · Simulation politique",
  description: "Et si vos idées passaient l'épreuve du réel ? Un prototype de simulation politique IA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0e14" />
      </head>
      <body style={{ margin: 0, background: "#0a0e14", color: "#d4d4d0", WebkitFontSmoothing: "antialiased" }}>
        {children}
      </body>
    </html>
  );
}
