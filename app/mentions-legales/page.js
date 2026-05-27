"use client";

import Link from "next/link";

const COLORS = {
  bg: "#fafaf7",
  bgPanel: "#ffffff",
  navy: "#0a1a3a",
  gold: "#b8954a",
  text: "#1a1a1a",
  textMuted: "#5a5a5a",
  textDim: "#8a8a8a",
  border: "#e0dcd3",
};

export default function MentionsLegales() {
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
          ◊ MENTIONS LÉGALES
        </div>

        <h1 style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 34,
          fontWeight: 600,
          color: COLORS.navy,
          lineHeight: 1.1,
          margin: "0 0 36px",
          letterSpacing: "-0.015em",
        }}>
          Mentions légales
        </h1>

        <Section title="Éditeur du site">
          <p style={pStyle}>
            Republica est édité par <strong style={{ color: COLORS.navy }}>Nouvelle Énergie</strong>.
          </p>
          <p style={{ ...pStyle, fontSize: 13, color: COLORS.textMuted, fontStyle: "italic" }}>
            Republica est actuellement en phase de bêta-test. Les coordonnées complètes de l'éditeur seront publiées lors de la mise en ligne publique.
          </p>
        </Section>

        <Section title="Directeur de publication">
          <p style={pStyle}>Karl Gateau</p>
        </Section>

        <Section title="Contact">
          <p style={pStyle}>
            <em style={{ color: COLORS.textMuted }}>Contact bientôt disponible.</em>
          </p>
          <p style={{ ...pStyle, fontSize: 13, color: COLORS.textMuted }}>
            Pour toute question urgente durant la phase de bêta, vous pouvez nous contacter via le site de Nouvelle Énergie : <a href="https://www.unenouvelleenergie.fr/" target="_blank" rel="noopener noreferrer" style={linkStyle}>unenouvelleenergie.fr</a>.
          </p>
        </Section>

        <Section title="Hébergeur">
          <p style={pStyle}>
            Vercel Inc.<br/>
            440 N Barranca Avenue #4133<br/>
            Covina, CA 91723, États-Unis<br/>
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>vercel.com</a>
          </p>
        </Section>

        <Section title="Génération de contenu par IA">
          <p style={pStyle}>
            Les dossiers, conséquences et synthèses présentés sur Republica sont générés en temps réel par l'API <strong>Claude (Anthropic)</strong>, États-Unis. Anthropic est responsable du modèle d'IA, Nouvelle Énergie est responsable du paramétrage et du contexte de génération.
          </p>
          <p style={pStyle}>
            Tous les sujets, chiffres, organisations et positions exprimées sont <strong style={{ color: COLORS.navy }}>illustratifs</strong> et ne reflètent pas la réalité politique française. Aucun parti politique, aucune personne réelle n'est cité par son nom propre.
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p style={pStyle}>
            Le code source, les éléments graphiques et la conception de Republica sont la propriété de Nouvelle Énergie. Toute reproduction non autorisée est interdite.
          </p>
        </Section>

        <Section title="Responsabilité">
          <p style={pStyle}>
            Les contenus générés par IA sont des simulations à vocation pédagogique et de réflexion politique. Ils n'ont aucune valeur prédictive et ne sauraient engager la responsabilité de l'éditeur quant à leur exactitude factuelle ou leur fidélité à la réalité.
          </p>
        </Section>

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
          <Link href="/a-propos" style={{ color: COLORS.textDim, textDecoration: "none" }}>À PROPOS</Link>
          <Link href="/confidentialite" style={{ color: COLORS.textDim, textDecoration: "none" }}>CONFIDENTIALITÉ</Link>
          <Link href="/" style={{ color: COLORS.textDim, textDecoration: "none" }}>JOUER</Link>
        </div>
      </div>
    </main>
  );
}

const pStyle = {
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: 15,
  lineHeight: 1.7,
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const linkStyle = {
  color: "#b8954a",
  textDecoration: "underline",
};

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        color: "#b8954a",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontWeight: 700,
        margin: "0 0 14px",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
