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

export default function Confidentialite() {
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
          ◊ CONFIDENTIALITÉ
        </div>

        <h1 style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 34,
          fontWeight: 600,
          color: COLORS.navy,
          lineHeight: 1.1,
          margin: "0 0 28px",
          letterSpacing: "-0.015em",
        }}>
          Confidentialité<br/>
          <em style={{ color: COLORS.gold }}>& données personnelles</em>
        </h1>

        <p style={{ ...pStyle, marginBottom: 32, fontSize: 14, color: COLORS.textMuted, fontStyle: "italic" }}>
          Republica respecte le Règlement Général sur la Protection des Données (RGPD). Voici précisément ce qui est collecté et pourquoi.
        </p>

        <Section title="1 · Statistiques de visite anonymes">
          <p style={pStyle}>
            Nous utilisons <strong>Plausible Analytics</strong> pour mesurer la fréquentation de Republica.
          </p>
          <p style={pStyle}>
            Ce qui est collecté : pages visitées, source du trafic (lien partagé, moteur de recherche…), pays approximatif, type d'appareil. Ces données sont <strong style={{ color: COLORS.navy }}>strictement anonymes</strong>.
          </p>
          <p style={pStyle}>
            Ce qui <strong>n'est pas</strong> collecté : aucune adresse IP stockée, aucun cookie, aucun identifiant personnel, aucune session traçable individuellement.
          </p>
          <p style={pStyle}>
            Plausible est hébergé en Europe et conforme RGPD nativement, sans bandeau de consentement requis.
          </p>
        </Section>

        <Section title="2 · Données de partie anonymes">
          <p style={pStyle}>
            À la fin de chaque mandat, les données suivantes sont enregistrées dans <strong>Airtable</strong> :
          </p>
          <ul style={ulStyle}>
            <li>Vos cinq décisions arbitrales</li>
            <li>Votre profil politique calculé (ex : « Libéral réformateur »)</li>
            <li>Les indicateurs finaux de votre mandat (dette, confiance, etc.)</li>
            <li>Un identifiant de session anonyme (non lié à votre identité)</li>
          </ul>
          <p style={pStyle}>
            Ces données sont collectées <strong style={{ color: COLORS.navy }}>à des fins statistiques uniquement</strong> : comprendre quels profils politiques émergent, quelles décisions sont les plus prises, à quelle étape les joueurs s'arrêtent.
          </p>
        </Section>

        <Section title="3 · Email (uniquement si vous le donnez)">
          <p style={pStyle}>
            À la fin de votre mandat, vous pouvez choisir de saisir votre adresse email pour recevoir votre profil de président.
          </p>
          <p style={pStyle}>
            <strong>Cette saisie est entièrement facultative</strong>. Vous pouvez jouer et obtenir votre profil sans la fournir.
          </p>
          <p style={pStyle}>
            Votre email est utilisé pour vous envoyer votre bilan personnalisé et, éventuellement, des informations sur Nouvelle Énergie. Il ne sera <strong style={{ color: COLORS.navy }}>jamais cédé, vendu ni transmis à un tiers</strong>.
          </p>
          <p style={pStyle}>
            Vous pouvez à tout moment demander la suppression de votre email de notre base.
          </p>
        </Section>

        <Section title="4 · Vos droits (RGPD)">
          <p style={pStyle}>
            Conformément aux articles 15 à 22 du RGPD, vous pouvez à tout moment exercer vos droits sur les données vous concernant :
          </p>
          <ul style={ulStyle}>
            <li><strong>Droit d'accès</strong> : connaître les données stockées vous concernant</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : faire supprimer vos données</li>
            <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format ouvert</li>
            <li><strong>Droit d'opposition</strong> : refuser tout traitement marketing</li>
          </ul>
          <p style={pStyle}>
            Pour exercer ces droits, contactez-nous via <a href="https://www.unenouvelleenergie.fr/" target="_blank" rel="noopener noreferrer" style={linkStyle}>le site de Nouvelle Énergie</a>. Un email de contact dédié sera bientôt disponible.
          </p>
          <p style={pStyle}>
            Vous pouvez également déposer une plainte auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={linkStyle}>cnil.fr</a>) si vous estimez vos droits non respectés.
          </p>
        </Section>

        <Section title="5 · Sous-traitants et transferts">
          <p style={pStyle}>
            Republica fait appel à trois prestataires techniques :
          </p>
          <ul style={ulStyle}>
            <li><strong>Vercel</strong> (États-Unis) : hébergement du site</li>
            <li><strong>Anthropic</strong> (États-Unis) : génération des dossiers par IA</li>
            <li><strong>Airtable</strong> (États-Unis) : stockage des données de partie et emails</li>
            <li><strong>Plausible</strong> (Europe) : statistiques de visite</li>
          </ul>
          <p style={pStyle}>
            Les transferts de données vers les États-Unis sont encadrés par les clauses contractuelles types de la Commission européenne.
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
          <Link href="/mentions-legales" style={{ color: COLORS.textDim, textDecoration: "none" }}>MENTIONS LÉGALES</Link>
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

const ulStyle = {
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: 15,
  lineHeight: 1.8,
  color: "#1a1a1a",
  margin: "0 0 16px",
  paddingLeft: 24,
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
