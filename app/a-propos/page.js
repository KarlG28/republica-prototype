"use client";

import Link from "next/link";

const COLORS = {
  bg: "#fafaf7",
  bgPanel: "#ffffff",
  navy: "#0a1a3a",
  gold: "#b8954a",
  red: "#a83232",
  text: "#1a1a1a",
  textMuted: "#5a5a5a",
  textDim: "#8a8a8a",
  border: "#e0dcd3",
};

export const metadata = {
  title: "À propos · Republica",
  description: "Republica est une simulation politique lancée par Nouvelle Énergie.",
};

export default function APropos() {
  return (
    <main style={{
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "40px 20px 80px",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <Link href="/" style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          color: COLORS.gold,
          letterSpacing: "0.2em",
          textDecoration: "none",
          fontWeight: 600,
          display: "inline-block",
          marginBottom: 32,
        }}>
          ← REPUBLICA
        </Link>

        <div style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          color: COLORS.gold,
          letterSpacing: "0.25em",
          fontWeight: 600,
          marginBottom: 14,
        }}>
          ◊ À PROPOS
        </div>

        <h1 style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 38,
          fontWeight: 600,
          color: COLORS.navy,
          lineHeight: 1.1,
          margin: "0 0 28px",
          letterSpacing: "-0.015em",
        }}>
          Cinq décisions.<br/>
          <em style={{ color: COLORS.gold }}>Cent jours pour gouverner.</em>
        </h1>

        <div style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 16,
          color: COLORS.text,
          lineHeight: 1.75,
        }}>
          <p style={{ margin: "0 0 22px" }}>
            Republica est une simulation politique expérimentale lancée par <strong style={{ color: COLORS.navy }}>Nouvelle Énergie, parti de la liberté en France</strong>.
          </p>

          <p style={{ margin: "0 0 22px" }}>
            Le concept est simple : vous prenez la place du Président de la République pendant cinq décisions. Chaque dossier est généré en temps réel par une intelligence artificielle (Claude, Anthropic). Vous arbitrez, l'IA déroule les conséquences. À la fin, vous découvrez votre profil politique.
          </p>

          <p style={{ margin: "0 0 22px" }}>
            L'objectif n'est pas de prédire l'avenir. C'est de montrer la complexité des choix présidentiels, et de faire émerger les positions de Nouvelle Énergie sur les grands enjeux du pays.
          </p>

          <p style={{ margin: "0 0 32px" }}>
            Tous les dossiers sont fictifs. Aucun parti, aucune personne réelle n'est cité par son nom. Les chiffres et les organisations sont illustratifs.
          </p>
        </div>

        <a href="https://www.unenouvelleenergie.fr/" target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "14px 24px",
            background: COLORS.navy,
            color: "#fafaf7",
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            textDecoration: "none",
            marginTop: 8,
          }}>
          Découvrir Nouvelle Énergie ↗
        </a>

        <div style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          fontFamily: "ui-monospace, monospace",
          fontSize: 10,
          color: COLORS.textDim,
          letterSpacing: "0.15em",
        }}>
          <Link href="/mentions-legales" style={{ color: COLORS.textDim, textDecoration: "none" }}>MENTIONS LÉGALES</Link>
          <Link href="/confidentialite" style={{ color: COLORS.textDim, textDecoration: "none" }}>CONFIDENTIALITÉ</Link>
          <Link href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>JOUER</Link>
        </div>
      </div>
    </main>
  );
}
