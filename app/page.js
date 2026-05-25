"use client";

import { useState, useMemo, useEffect } from "react";

// ============================================================
// REPUBLICA · PROTOTYPE — VERSION CINÉMATOGRAPHIQUE
// Génération IA en temps réel · 5 décisions par session
// ============================================================

const COLORS = {
  bg: "#fafaf7",
  bgPanel: "#ffffff",
  bgDark: "#0a1a3a",
  bgDarker: "#061226",
  navy: "#0a1a3a",
  navyLight: "#1e3a7a",
  gold: "#b8954a",
  goldDim: "#8a7037",
  goldLight: "#d9b86b",
  text: "#1a1a1a",
  textBright: "#0a1a3a",
  textMuted: "#5a5a5a",
  textDim: "#8a8a8a",
  textOnDark: "#fafaf7",
  border: "#e0dcd3",
  red: "#a83232",
  redLight: "#c95a5a",
  green: "#3a7a4a",
  blue: "#2a5a8a",
  yellow: "#a87a2a",
};

// Image de fond : bureau en bois noble (libre de droits Unsplash)
const BG_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80";

const SECTIONS = {
  welcome: "welcome",
  intro: "intro",
  loading: "loading",
  dossier: "dossier",
  scenarioDetail: "scenarioDetail",
  consequence: "consequence",
  profile: "profile",
};
const TOTAL_DECISIONS = 5;

function resolveColor(name) {
  const map = { blue: COLORS.blue, red: COLORS.red, redLight: COLORS.redLight, green: COLORS.green, gold: COLORS.gold, yellow: COLORS.yellow, muted: COLORS.textMuted, navy: COLORS.navy };
  return map[name] || COLORS.textMuted;
}

// Tracker Plausible : ne fait rien si Plausible bloqué/indisponible
function track(eventName, props) {
  try {
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      window.plausible(eventName, props ? { props } : undefined);
    }
  } catch (e) {
    // silencieux
  }
}

function renderRich(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} style={{ color: COLORS.navy, fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

function renderTwist(text) {
  if (!text) return null;
  // Coupe la phrase au "mais" pour mettre la 2ème partie en rouge gras
  const match = text.match(/^(.+?)(\.\.\.|…)\s*mais\s+(.+)$/i);
  if (!match) return text;
  return (
    <>
      {match[1]}{match[2]} mais{" "}
      <strong style={{ color: COLORS.red, fontWeight: 700, fontStyle: "italic" }}>
        {match[3]}
      </strong>
    </>
  );
}

const FALLBACK_DOSSIER = {
  id: "fallback",
  day: "J+30",
  tag: "Note d'arbitrage présidentiel",
  title: "Hausse imprévue du prix de l'électricité",
  subtitle: "Tarif réglementé · décision urgente attendue",
  summary: {
    contexte: "La CRE annonce une **hausse de 18%** du tarif réglementé. 24 millions de foyers concernés.",
    enjeu: "Trois voies sont possibles. Le choix sera lourd politiquement.",
  },
  sources: ["[1] Commission de régulation de l'énergie · 2026"],
  agents: [
    { name: "Bercy", color: "blue", stance: "PRUDENTE", quote: "Le bouclier coûte 12 Md€/an. Limite atteinte." },
    { name: "Associations consommateurs", color: "red", stance: "MOBILISÉES", quote: "Inacceptable pour les ménages modestes." },
    { name: "EDF", color: "gold", stance: "VIGILANTE", quote: "Toute mesure de blocage prolongée fragilisera nos investissements." },
    { name: "Opinion publique", color: "muted", stance: "INQUIÈTE 84%", quote: "Le pouvoir d'achat redevient la 1re préoccupation." },
  ],
  scenarios: [
    { code: "SCÉNARIO A", color: "blue", title: "Bouclier tarifaire prolongé", risk: "COÛTEUX", desc: "Prolongation 12 mois. Coût pour l'État : 8 Md€.", tags: [["+ Ménages", true], ["+ Opinion", true], ["− Bercy", false]], deltas: { debt: 0.6, confidence: 4, parliament: 2, tension: -0.4, spread: 3, social: 2 }, signature: "A" },
    { code: "SCÉNARIO B", color: "gold", title: "Bouclier ciblé revenus modestes", risk: "ÉQUILIBRÉ", desc: "Aide concentrée sur les 6M de foyers les plus modestes. Coût : 2,5 Md€.", tags: [["+ Justice sociale", true], ["+ Bercy", true], ["± Opinion", null]], deltas: { debt: 0.2, confidence: 2, parliament: 1, tension: -0.1, spread: 0, social: 1, liberal: 1 }, signature: "B" },
    { code: "SCÉNARIO C", color: "muted", title: "Laisser passer la hausse", risk: "LIBÉRAL", desc: "Pas d'intervention. Vérité des prix.", tags: [["+ Marchés", true], ["+ EDF", true], ["− Opinion massive", false]], deltas: { debt: -0.3, confidence: -7, parliament: -3, tension: 1.2, spread: -2, liberal: 2 }, signature: "C" },
  ],
  consequences: {
    A: { title: "Bouclier prolongé", narrative: "Décision saluée par 76% des Français. Mais le déficit se creuse et les marchés s'inquiètent.", events: [{ day: "+5", label: "Décret de prolongation publié", color: "blue" }, { day: "+15", label: "76% d'opinion favorable", color: "green" }, { day: "+30", label: "Spread OAT s'écarte de 3 pb", color: "yellow" }, { day: "+60", label: "Bercy demande un plan d'extinction", color: "red" }] },
    B: { title: "Bouclier ciblé engagé", narrative: "Mesure technique. Les classes moyennes protestent.", events: [{ day: "+8", label: "Décret de ciblage publié", color: "blue" }, { day: "+22", label: "Manifestation des classes moyennes", color: "yellow" }, { day: "+45", label: "Économie réelle : 5,5 Md€", color: "green" }, { day: "+70", label: "Opposition lance « classes moyennes oubliées »", color: "red" }] },
    C: { title: "Aucune intervention", narrative: "Décision libérale assumée. Vague de mobilisation sociale.", events: [{ day: "+5", label: "Hausse effective de 18%", color: "red" }, { day: "+15", label: "1ère manifestation nationale", color: "red" }, { day: "+30", label: "Cote de confiance : −7 points", color: "red" }, { day: "+60", label: "Bercy salue la « rigueur budgétaire »", color: "green" }] },
  },
};

const FALLBACK_PARTNER_SUMMARY = `Vous avez gouverné cinq décisions sous tension. Voici comment Nouvelle Énergie aurait abordé ces mêmes choix.

Chez Nouvelle Énergie, nous croyons qu'une France plus libre est une France qui respire, décide et agit davantage. Notre boussole : libérer avant d'encadrer, faire confiance avant de contrôler.

Sur les arbitrages économiques, nous aurions libéré l'investissement privé avant d'augmenter l'impôt. Sur les questions de société, nous aurions rendu le pouvoir aux acteurs de terrain. Sur l'Europe, nous aurions porté un message clair : la France propose, l'Europe avance.

Si cette manière de gouverner vous parle, Nouvelle Énergie vous tend la main.`;

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function Page() {
  const [section, setSection] = useState(SECTIONS.welcome);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dossiers, setDossiers] = useState([]);
  const [choices, setChoices] = useState({});
  const [indicators, setIndicators] = useState({ debt: 115.6, confidence: 52, parliament: 287, tension: 4.2, spread: 64 });
  const [scores, setScores] = useState({ liberal: 0, social: 0, autorite: 0, europe: 0 });
  const [loadingMessage, setLoadingMessage] = useState("");
  const [generationError, setGenerationError] = useState(null);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(null);
  // Fixé au démarrage : à quel dossier l'urgence aura lieu (2 ou 3 sur 5)
  const [urgentDossierIdx] = useState(() => Math.random() < 0.5 ? 2 : 3);

  // ID unique de session (pour relier l'opt-in à la session anonyme)
  const [sessionId] = useState(() => {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  });
  
  // Synthèse Nouvelle Énergie (générée à la fin du mandat)
  const [partnerSummary, setPartnerSummary] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState(null);

  async function generateDossier() {
    const previousTitles = dossiers.map(d => d.title);
    const nextIdx = dossiers.length;
    const forceUrgent = nextIdx === urgentDossierIdx;

    setLoadingMessage(forceUrgent ? "Une crise survient à l'Élysée..." : "Claude rédige votre prochain dossier...");
    setSection(SECTIONS.loading);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousTitles, forceUrgent }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      const data = await response.json();
      const newDossier = data.dossier;
      if (!newDossier || !newDossier.title || !newDossier.scenarios || newDossier.scenarios.length < 2) {
        throw new Error("Format de dossier invalide");
      }
      setDossiers(prev => [...prev, newDossier]);
      setSection(SECTIONS.dossier);
    } catch (err) {
      console.error("Erreur génération:", err);
      setGenerationError(err.message);
      const fallback = { ...FALLBACK_DOSSIER, id: `fallback-${currentIdx}` };
      setDossiers(prev => [...prev, fallback]);
      setSection(SECTIONS.dossier);
    }
  }

  async function generatePartnerSummary() {
    setPartnerLoading(true);
    setPartnerError(null);
    try {
      const decisions = dossiers.map((d, i) => {
        const sig = choices[i];
        const sc = d.scenarios?.find(s => s.signature === sig);
        return {
          title: d.title,
          urgent: !!d.urgent,
          scenarioTitle: sc ? sc.title : "Aucun choix",
        };
      });

      const response = await fetch("/api/generate-partner-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisions }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      const data = await response.json();
      setPartnerSummary(data.summary);
    } catch (err) {
      console.error("Erreur synthèse partenaire:", err);
      setPartnerError(err.message);
      setPartnerSummary(FALLBACK_PARTNER_SUMMARY);
    } finally {
      setPartnerLoading(false);
    }
  }

async function saveSessionAnonymous(familyData) {
    try {
      const decisionsBrief = dossiers.map((d, i) => {
        const sig = choices[i];
        const sc = d.scenarios?.find(s => s.signature === sig);
        return {
          title: d.title,
          urgent: !!d.urgent,
          choice: sig,
          choiceTitle: sc ? sc.title : null,
        };
      });

      await fetch("/api/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          family: familyData.shortLabel,
          adjective: familyData.adjective,
          decisions: decisionsBrief,
          urgentIdx: urgentDossierIdx,
          indicators,
          scores,
        }),
      });
    } catch (err) {
      console.error("Erreur sauvegarde session anonyme:", err);
      // silencieux : on ne casse pas l'expérience si Airtable échoue
    }
  }
  
  const goToIntro = () => setSection(SECTIONS.intro);
  const startSession = () => {
    track("start_session");
    setCurrentIdx(0);
    generateDossier();
  };

  const selectScenario = (idx) => {
    setSelectedScenarioIdx(idx);
    setSection(SECTIONS.scenarioDetail);
  };

const confirmChoice = () => {
    const dossier = dossiers[currentIdx];
    const scenario = dossier.scenarios[selectedScenarioIdx];
    track("decision_made", { idx: String(currentIdx + 1), urgent: dossier.urgent ? "yes" : "no" });
    const deltas = scenario.deltas || {};
    const signature = scenario.signature;
    setChoices((c) => ({ ...c, [currentIdx]: signature }));
    setIndicators((i) => ({
      debt: +(i.debt + (deltas.debt || 0)).toFixed(1),
      confidence: Math.max(0, Math.min(100, i.confidence + (deltas.confidence || 0))),
      parliament: i.parliament + (deltas.parliament || 0),
      tension: +(Math.max(0, Math.min(10, i.tension + (deltas.tension || 0)))).toFixed(1),
      spread: i.spread + (deltas.spread || 0),
    }));
    setScores((s) => ({
      liberal: s.liberal + (deltas.liberal || 0),
      social: s.social + (deltas.social || 0),
      autorite: s.autorite + (deltas.autorite || 0),
      europe: s.europe + (deltas.europe || 0),
    }));
    setSelectedScenarioIdx(null);
    setSection(SECTIONS.consequence);
  };

  const cancelChoice = () => {
    setSelectedScenarioIdx(null);
    setSection(SECTIONS.dossier);
  };

const goNext = () => {
    if (currentIdx + 1 >= TOTAL_DECISIONS) {
      track("mandate_completed");
      setSection(SECTIONS.profile);
      generatePartnerSummary();
    } else {
      setCurrentIdx(currentIdx + 1);
      generateDossier();
    }
  };

  const restart = () => window.location.reload();

  const currentDossier = dossiers[currentIdx];
  const currentChoice = choices[currentIdx];

  return (
    <main style={{
      minHeight: "100vh",
      background: `linear-gradient(rgba(250,250,247,0.94), rgba(250,250,247,0.97)), url(${BG_IMAGE}) center / cover no-repeat fixed`,
      color: COLORS.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: 0,
      margin: 0,
      position: "relative",
    }}>
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,26,58,0.15) 100%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px 80px", position: "relative", zIndex: 1 }}>
        {section !== SECTIONS.welcome && <Header section={section} currentIdx={currentIdx} total={TOTAL_DECISIONS} />}

        <FadeIn keyProp={section + "-" + currentIdx}>
          {section === SECTIONS.welcome && <Welcome onContinue={goToIntro} />}
          {section === SECTIONS.intro && <Intro onStart={startSession} />}
          {section === SECTIONS.loading && <Loading message={loadingMessage} />}
          {section === SECTIONS.dossier && currentDossier && (
            <DossierView dossier={currentDossier} indicators={indicators} onSelectScenario={selectScenario} fallbackError={generationError} />
          )}
          {section === SECTIONS.scenarioDetail && currentDossier && selectedScenarioIdx !== null && (
            <ScenarioDetail dossier={currentDossier} scenarioIdx={selectedScenarioIdx} onConfirm={confirmChoice} onCancel={cancelChoice} />
          )}
          {section === SECTIONS.consequence && currentDossier && (
            <ConsequenceView dossier={currentDossier} choice={currentChoice} indicators={indicators} isLast={currentIdx + 1 >= TOTAL_DECISIONS} onContinue={goNext} />
          )}
         {section === SECTIONS.profile && (
            <Profile choices={choices} dossiers={dossiers} indicators={indicators} scores={scores} onRestart={restart}
              partnerSummary={partnerSummary} partnerLoading={partnerLoading} partnerError={partnerError}
              sessionId={sessionId} onSaveAnonymous={saveSessionAnonymous} />
          )}
        </FadeIn>

        <Footer />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes urgentStripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        @keyframes urgentGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168, 50, 50, 0.45), 0 0 30px rgba(168, 50, 50, 0.15); }
          50% { box-shadow: 0 0 0 6px rgba(168, 50, 50, 0), 0 0 60px rgba(168, 50, 50, 0.35); }
        }
        @keyframes urgentBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        @keyframes urgentShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1px); }
          75% { transform: translateX(1px); }
        }
        .republica-fade-in { animation: fadeInUp 0.5s ease-out; }
        .republica-urgent-glow { animation: urgentGlow 2s ease-in-out infinite; }
        .republica-urgent-stripes-top, .republica-urgent-stripes-bottom {
          height: 14px;
          background-image: repeating-linear-gradient(
            -45deg,
            #a83232,
            #a83232 10px,
            #fafaf7 10px,
            #fafaf7 20px
          );
          animation: urgentStripes 1s linear infinite;
        }
        .republica-urgent-blink {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #a83232;
          border-radius: 50%;
          animation: urgentBlink 1.2s ease-in-out infinite;
        }
        .republica-urgent-card {
          animation: urgentShake 0.3s ease-in-out 3, urgentGlow 2s ease-in-out infinite 1s;
        }
      `}</style>
    </main>
  );
}

function FadeIn({ children, keyProp }) {
  return <div key={keyProp} className="republica-fade-in">{children}</div>;
}

// ============================================================
// ÉCRAN DE BIENVENUE (Félicitations élection)
// ============================================================

function Welcome({ onContinue }) {
  return (
    <Section>
      <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
        <div style={{
          display: "inline-block",
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold} 0%, ${COLORS.goldDim} 100%)`,
          marginBottom: 28,
          position: "relative",
          boxShadow: `0 6px 20px ${COLORS.navy}25`,
        }}>
          <div style={{
            position: "absolute",
            inset: 6,
            borderRadius: "50%",
            border: `2px solid ${COLORS.bg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 32,
            color: COLORS.bg,
            fontWeight: 600,
            fontStyle: "italic",
          }}>R</div>
        </div>

        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: COLORS.gold, letterSpacing: "0.35em", marginBottom: 18, fontWeight: 600 }}>
          — RÉPUBLIQUE FRANÇAISE —
        </div>

        <h1 style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 40,
          fontWeight: 600,
          color: COLORS.navy,
          lineHeight: 1.1,
          margin: "0 0 24px",
          letterSpacing: "-0.015em",
        }}>
          Félicitations.<br/>
          <em style={{ color: COLORS.gold }}>Vous venez d'être élu</em><br/>
          Président de la République.
        </h1>

        <p style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 17,
          color: COLORS.text,
          lineHeight: 1.75,
          fontStyle: "italic",
          margin: "0 auto 36px",
          maxWidth: 540,
        }}>
          Vous prendrez vos fonctions demain matin à l'Élysée.<br/>
          Cent jours s'ouvrent devant vous pour imprimer votre marque sur la nation.<br/>
          Chaque décision sera une trace dans l'Histoire.
        </p>

        <div style={{
          display: "inline-block",
          padding: "10px 24px",
          background: `${COLORS.gold}10`,
          border: `1px solid ${COLORS.gold}40`,
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          color: COLORS.gold,
          letterSpacing: "0.2em",
          marginBottom: 36,
        }}>
          ◊ PROCLAMATION OFFICIELLE ◊
        </div>

        <div>
          <BigButton onClick={onContinue}>Rejoindre l'Élysée ↗</BigButton>
        </div>
      </div>
    </Section>
  );
}

function Header({ section, currentIdx, total }) {
  const stepLabel = section === SECTIONS.intro ? "INVESTITURE"
    : section === SECTIONS.profile ? "BILAN DU MANDAT"
    : section === SECTIONS.loading ? "EN COURS..."
    : `DÉCISION ${currentIdx + 1} / ${total}`;
  return (
    <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-block", width: 7, height: 7, background: COLORS.gold, borderRadius: "50%" }}></span>
          <span style={{ color: COLORS.navy, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Republica · Prototype</span>
        </div>
        <span style={{ color: COLORS.textDim, fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em" }}>{stepLabel}</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: total + 1 }).map((_, i) => {
          let filled = false;
          if (section === SECTIONS.intro) filled = i === 0;
          else if (section === SECTIONS.profile) filled = true;
          else filled = i <= currentIdx + 1;
          return <div key={i} style={{ flex: 1, height: 3, background: filled ? COLORS.navy : COLORS.border, transition: "background 0.3s" }} />;
        })}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop: 44, padding: "18px 4px", borderTop: `1px solid ${COLORS.border}`, textAlign: "center" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textDim, letterSpacing: "0.1em" }}>
        REPUBLICA · SIMULATION PROSPECTIVE IA · RÉSULTATS NON PRÉDICTIFS
      </div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
        Personnages et données illustratifs · Dossiers générés par Claude
      </div>
    </div>
  );
}

function Intro({ onStart }) {
  return (
    <Section>
      <Tag>— Investiture présidentielle —</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 34, fontWeight: 600, color: COLORS.navy, lineHeight: 1.1, margin: "0 0 18px", letterSpacing: "-0.01em" }}>
        Cent jours pour gouverner.
      </h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 16, color: COLORS.text, lineHeight: 1.75, fontStyle: "italic", margin: "0 0 26px" }}>
        Huit centres de pouvoir vous attendent : Bercy, les syndicats, Bruxelles, l'opinion, les médias, les marchés, le Conseil d'État, les collectivités. Chaque décision aura des conséquences. Aucune ne fera l'unanimité.
      </p>

      <div style={{ background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.gold}`, padding: 16, margin: "0 0 22px", boxShadow: `0 1px 3px ${COLORS.navy}10` }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 600 }}>◊ ÉTAT DE LA NATION · DONNÉES VÉRIFIÉES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 1, background: COLORS.border }}>
          <Stat label="Dette / PIB" value="115,6%" note="INSEE 2025" />
          <Stat label="Déficit" value="5,1%" note="du PIB" />
          <Stat label="Croissance" value="1,1%" note="annuelle" />
          <Stat label="Chômage" value="7,3%" note="BIT" />
        </div>
      </div>

      <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 28px" }}>
        Simulation prospective IA. Les chiffres de départ sont vérifiés. <strong style={{ color: COLORS.navy }}>Chaque dossier est rédigé en temps réel par Claude. Aucune session n'est identique.</strong>
      </p>

      <BigButton onClick={onStart}>Prendre mes fonctions ↗</BigButton>
    </Section>
  );
}

function Loading({ message }) {
  return (
    <Section>
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ display: "inline-block", width: 36, height: 36, border: `2px solid ${COLORS.border}`, borderTopColor: COLORS.gold, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 16, color: COLORS.navy, marginTop: 22, fontStyle: "italic" }}>{message}</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textDim, marginTop: 10, letterSpacing: "0.15em" }}>GÉNÉRATION EN COURS · ~10 SECONDES</div>
      </div>
    </Section>
  );
}

function DossierView({ dossier, indicators, onSelectScenario, fallbackError }) {
  const isUrgent = dossier.urgent;
  const timer = dossier.timer || "48H";
  const risks = Array.isArray(dossier.risks) ? dossier.risks : [];

  return (
    <Section>
      <Dashboard indicators={indicators} />

      {fallbackError && (
        <div style={{ padding: 10, background: `${COLORS.yellow}15`, border: `1px solid ${COLORS.yellow}40`, fontSize: 11, color: COLORS.yellow, marginBottom: 14, fontFamily: "ui-monospace, monospace" }}>
          ⚠ GÉNÉRATION IA INDISPONIBLE — Dossier de secours utilisé
        </div>
      )}

     {/* ═══ MODE URGENT : irruption visuelle ═══ */}
      {isUrgent ? (
        <div className="republica-urgent-card" style={{
          marginBottom: 22,
          border: `2px solid ${COLORS.red}`,
          background: "#fff",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Bandes rayées rouges qui défilent en haut */}
          <div className="republica-urgent-stripes-top" />

          <div style={{ padding: "20px 22px" }}>
            {/* Bandeau d'urgence avec sirène clignotante */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.red, fontWeight: 700 }}>
                <span className="republica-urgent-blink" />
                URGENCE ÉLYSÉE — INTERRUPTION DE MANDAT
              </span>
              <span style={{
                color: COLORS.red,
                fontWeight: 800,
                background: `${COLORS.red}15`,
                padding: "4px 10px",
                border: `1px solid ${COLORS.red}50`,
              }}>
                {timer}
              </span>
            </div>

            {/* Le titre choc */}
            <div style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.red,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              marginBottom: 10,
            }}>
              {dossier.title}
            </div>

            {/* Le subtitle direct, sans italique mou */}
            {dossier.subtitle && (
              <div style={{
                fontSize: 15,
                color: COLORS.text,
                lineHeight: 1.5,
                fontWeight: 500,
              }}>
                {renderRich(dossier.subtitle)}
              </div>
            )}
          </div>

          {/* Bandes rayées rouges qui défilent en bas */}
          <div className="republica-urgent-stripes-bottom" />
        </div>
      ) : (
        <>
          {/* ═══ MODE NORMAL : timer + bloc CE QUI SE PASSE ═══ */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "transparent",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            marginBottom: 18,
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
          }}>
            <span style={{ color: COLORS.textDim }}>
              JOUR {dossier.day || "?"} · MANDAT EN COURS
            </span>
            <span style={{
              color: COLORS.navy,
              fontWeight: 700,
            }}>
              VOUS AVEZ {timer}
            </span>
          </div>

          <div style={{
            border: `1px solid ${COLORS.border}`,
            borderLeft: `3px solid ${COLORS.navy}`,
            padding: "16px 18px",
            marginBottom: 14,
            background: "#fff",
          }}>
            <div style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: COLORS.textDim,
              marginBottom: 10,
              fontWeight: 600,
            }}>
              CE QUI SE PASSE
            </div>
            <div style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 22,
              fontWeight: 600,
              color: COLORS.navy,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}>
              {dossier.title}
            </div>
            {dossier.subtitle && (
              <div style={{
                fontSize: 14,
                color: COLORS.textMuted,
                marginTop: 8,
                fontStyle: "italic",
                lineHeight: 1.45,
              }}>
                {dossier.subtitle}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ BLOC 2 : CE QUE VOUS RISQUEZ ═══ */}
      {risks.length > 0 && (
        <div style={{
          border: `1px solid ${COLORS.border}`,
          borderLeft: `3px solid ${COLORS.gold}`,
          padding: "14px 18px",
          marginBottom: 18,
          background: "#fff",
        }}>
          <div style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: COLORS.textDim,
            marginBottom: 10,
            fontWeight: 600,
          }}>
            CE QUE VOUS RISQUEZ
          </div>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}>
            {risks.map((r, i) => (
              <li key={i} style={{
                fontSize: 14,
                color: COLORS.navy,
                lineHeight: 1.5,
                padding: "6px 0",
                borderTop: i > 0 ? `1px dashed ${COLORS.border}` : "none",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}>
                <span style={{ color: COLORS.gold, fontWeight: 700, flexShrink: 0 }}>—</span>
                <span dangerouslySetInnerHTML={{ __html: String(r).replace(/\*\*(.+?)\*\*/g, '<strong style="color: ' + COLORS.navy + '; font-weight: 600">$1</strong>') }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ═══ LE RESTE : agents + scénarios, inchangé ═══ */}
      <SubTag>Centres de pouvoir · positions exprimées</SubTag>
      <AgentsGrid>
        {(dossier.agents || []).filter(Boolean).map((a, i) => (
          <Agent key={i} name={a.name || "Acteur"} color={resolveColor(a.color || "muted")} stance={a.stance || ""} quote={a.quote || ""} />
        ))}
      </AgentsGrid>

  <SubTag>Votre arbitrage · {(dossier.scenarios || []).filter(Boolean).length} voies</SubTag>
      {(dossier.scenarios || []).filter(Boolean).map((s, i) => (
        <ScenarioButton key={i} code={s.code || `SCÉNARIO ${i+1}`} color={resolveColor(s.color || "blue")} title={s.title || "Sans titre"} risk={s.risk || ""}
          desc={s.desc || ""} tags={(s.tags || []).filter(Boolean).map(t => Array.isArray(t) ? t : [t, true])}
         onClick={() => onSelectScenario(i)} />
      ))}
    </Section>
  );
}

function ScenarioDetail({ dossier, scenarioIdx, onConfirm, onCancel }) {
  const scenario = dossier.scenarios[scenarioIdx];
  const color = resolveColor(scenario.color);
  const deltas = scenario.deltas || {};

  const impacts = [
    { label: "Dette / PIB", value: deltas.debt, unit: " pts", inverse: true },
    { label: "Confiance", value: deltas.confidence, unit: " pts" },
    { label: "Soutien AN", value: deltas.parliament, unit: " sièges" },
    { label: "Tension sociale", value: deltas.tension, unit: " pts", inverse: true },
    { label: "Spread OAT", value: deltas.spread, unit: " pb", inverse: true },
  ].filter(i => i.value !== undefined && i.value !== 0);

  return (
    <Section>
      <Tag>Approfondissement du scénario</Tag>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color, letterSpacing: "0.15em", fontWeight: 700, padding: "4px 10px", border: `1px solid ${color}40`, background: `${color}10` }}>{scenario.code}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textDim, fontWeight: 600, letterSpacing: "0.1em" }}>{scenario.risk}</span>
      </div>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 28, fontWeight: 600, color: COLORS.navy, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
        {scenario.title}
      </h1>

      <div style={{ padding: 18, background: COLORS.bgPanel, border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, marginBottom: 20 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 600 }}>◊ DESCRIPTION DÉTAILLÉE</div>
        <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 15, color: COLORS.text, lineHeight: 1.7, margin: 0 }}>
          {scenario.desc}
        </p>
      </div>

      {scenario.tags && scenario.tags.length > 0 && (
        <>
          <SubTag>Effets attendus sur les acteurs</SubTag>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
            {(scenario.tags || []).map((t, i) => {
              const tag = Array.isArray(t) ? { label: t[0], positive: t[1] } : t;
              return (
                <span key={i} style={{
                  padding: "6px 12px",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 11,
                  background: tag.positive === true ? `${COLORS.green}15` : tag.positive === false ? `${COLORS.red}12` : `${COLORS.yellow}15`,
                  color: tag.positive === true ? COLORS.green : tag.positive === false ? COLORS.red : COLORS.yellow,
                  fontWeight: 600,
                  border: `1px solid ${tag.positive === true ? COLORS.green : tag.positive === false ? COLORS.red : COLORS.yellow}30`,
                }}>{tag.label}</span>
              );
            })}
          </div>
        </>
      )}

      {impacts.length > 0 && (
        <>
          <SubTag>Impact projeté sur les indicateurs</SubTag>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 26 }}>
            {impacts.map((imp, i) => {
              const sign = imp.value > 0 ? "+" : "";
              const isGood = imp.inverse ? imp.value < 0 : imp.value > 0;
              const isBad = imp.inverse ? imp.value > 0 : imp.value < 0;
              const c = isGood ? COLORS.green : isBad ? COLORS.red : COLORS.textMuted;
              return (
                <div key={i} style={{ padding: "10px 12px", background: COLORS.bgPanel, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{imp.label}</div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, color: c, fontWeight: 700 }}>{sign}{imp.value}{imp.unit}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 16 }}>
        <button onClick={onCancel} style={{
          padding: "14px 18px", background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted,
          fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase", fontWeight: 600,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.navy; e.currentTarget.style.color = COLORS.navy; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; }}>
          ← Revenir
        </button>
        <BigButton onClick={onConfirm}>Valider ce choix ✓</BigButton>
      </div>
    </Section>
  );
}

function ConsequenceView({ dossier, choice, indicators, isLast, onContinue }) {
  const data = dossier.consequences?.[choice];
  if (!data) {
    return (
      <Section>
        <p>Erreur d'affichage des conséquences.</p>
        <BigButton onClick={onContinue}>Continuer ↗</BigButton>
      </Section>
    );
  }
  return (
    <Section>
      <Dashboard indicators={indicators} highlight />
      <Tag>◊ Conséquences de votre arbitrage</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 25, fontWeight: 600, color: COLORS.navy, lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.01em" }}>{data.title}</h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 15, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 22px" }}>{data.narrative}</p>
      <SubTag>Chronologie des semaines suivantes</SubTag>
      <Timeline events={data.events || []} />
      <BigButton onClick={onContinue}>{isLast ? "Voir le bilan de mon mandat ↗" : "Suite du mandat ↗"}</BigButton>
    </Section>
  );
}

function Profile({ choices, dossiers, indicators, scores, onRestart, partnerSummary, partnerLoading, partnerError, sessionId, onSaveAnonymous }) {
  const family = useMemo(() => classifyFamily(scores, indicators), [scores, indicators]);

  useEffect(() => {
    track("share_card_viewed", {
      family: family.shortLabel,
      adjective: family.adjective,
    });
    // Sauvegarde anonyme dans Airtable, une seule fois à l'arrivée du bilan
    if (onSaveAnonymous) onSaveAnonymous(family);
  }, []);

  return (
    <Section>
      <Tag>— Votre famille politique —</Tag>
      <div style={{ textAlign: "center", padding: "26px 24px", border: `1px solid ${COLORS.navy}30`, background: COLORS.bgPanel, margin: "0 0 24px", position: "relative", boxShadow: `0 4px 12px ${COLORS.navy}10` }}>
        <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, letterSpacing: "0.15em" }}>N° 048</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: COLORS.gold, letterSpacing: "0.25em", marginBottom: 8, fontWeight: 600 }}>CLASSIFICATION</div>
        <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 32, fontWeight: 600, color: COLORS.navy, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{family.label}</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.15em", marginTop: 12 }}>PROCHE DE : {family.closeTo}</div>
      </div>

      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 15, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", textAlign: "center", margin: "0 0 28px" }}>« {family.tagline} »</p>

      <SubTag>État final de votre mandat</SubTag>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 1, background: COLORS.border, marginBottom: 24 }}>
        <Stat label="Dette / PIB" value={`${indicators.debt}%`} note={delta(indicators.debt - 115.6)} />
        <Stat label="Confiance" value={`${indicators.confidence}%`} note={delta(indicators.confidence - 52)} />
        <Stat label="Soutien AN" value={`${indicators.parliament}`} note={delta(indicators.parliament - 287)} />
        <Stat label="Tension" value={`${indicators.tension}/10`} note={delta(indicators.tension - 4.2)} />
      </div>

      <SubTag>Vos décisions du mandat</SubTag>
      <div style={{ marginBottom: 24 }}>
        {dossiers.map((d, i) => {
          const c = choices[i];
          const sc = d.scenarios?.find(s => s.signature === c);
          return (
            <div key={i} style={{ padding: "10px 14px", background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${d.urgent ? COLORS.red : COLORS.gold}`, marginBottom: 6 }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, letterSpacing: "0.1em", marginBottom: 3 }}>{d.day} · {d.urgent ? "CRISE" : "DOSSIER"}</div>
              <div style={{ fontSize: 13, color: COLORS.navy, fontWeight: 600, marginBottom: 2 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" }}>→ {sc ? sc.title : "—"}</div>
            </div>
          );
        })}
      </div>

      <SubTag>Carte de partage · screenshot-able</SubTag>
      <div style={{
        background: "#fafaf7",
        border: `1px solid ${COLORS.border}`,
        padding: "28px 26px",
        position: "relative",
        overflow: "hidden",
        marginBottom: 26,
        color: COLORS.text,
        boxShadow: `0 8px 24px ${COLORS.navy}15`,
      }}>
        {/* Filigrane R en arrière-plan */}
        <div style={{
          position: "absolute",
          top: -30,
          right: -20,
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 200,
          color: `${COLORS.gold}10`,
          fontWeight: 600,
          lineHeight: 1,
          fontStyle: "italic",
        }}>R</div>

        <div style={{ position: "relative" }}>
          {/* En-tête type "Mandat terminé · X ans · Y crises" */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 14,
            marginBottom: 20,
            borderBottom: `1px solid ${COLORS.border}`,
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            color: COLORS.textDim,
            letterSpacing: "0.2em",
            fontWeight: 600,
          }}>
            <span>MANDAT TERMINÉ</span>
            <span>5 DÉCISIONS · {dossiers.filter(d => d.urgent).length} CRISE{dossiers.filter(d => d.urgent).length > 1 ? "S" : ""}</span>
          </div>

          {/* "Vous avez gouverné en..." */}
          <div style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            color: COLORS.gold,
            letterSpacing: "0.25em",
            fontWeight: 600,
            marginBottom: 10,
          }}>
            VOUS AVEZ GOUVERNÉ EN
          </div>

          {/* La famille en serif gros + adjectif en gold italique */}
          <div style={{
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 36,
            fontWeight: 600,
            color: COLORS.navy,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}>
            {family.shortLabel}{" "}
            <em style={{ color: COLORS.gold, fontWeight: 600 }}>{family.adjective}.</em>
          </div>

          {/* LE TWIST en gros — la phrase qui pique */}
          <div style={{
            paddingLeft: 14,
            borderLeft: `3px solid ${COLORS.red}`,
            marginBottom: 22,
          }}>
            <div style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 19,
              fontStyle: "italic",
              color: COLORS.navy,
              lineHeight: 1.4,
              fontWeight: 500,
            }}>
              « {renderTwist(family.shareQuote)} »
            </div>
          </div>

          {/* Footer signature */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: `1px solid ${COLORS.border}`,
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            color: COLORS.textDim,
            letterSpacing: "0.2em",
            fontWeight: 600,
          }}>
            <span>REPUBLICA.FR</span>
            <span style={{ color: COLORS.gold }}>#JOUEZ_LE_VÔTRE</span>
          </div>
        </div>
      </div>

{/* ═══ BLOC OPT-IN EMAIL ═══ */}
      <SubTag>◊ Mes 100 jours à l'Élysée</SubTag>
      <OptInForm sessionId={sessionId} family={family} />

{/* ═══ BLOC PARTENAIRE NOUVELLE ÉNERGIE ═══ */}
      <SubTag>Une autre manière de gouverner ?</SubTag>
      <div style={{
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderTop: `3px solid ${COLORS.gold}`,
        padding: "24px 22px",
        marginBottom: 26,
        boxShadow: `0 2px 8px ${COLORS.navy}08`,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          paddingBottom: 14,
          borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <span style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: `2px solid ${COLORS.gold}`,
            background: "transparent",
          }} />
          <span style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            color: COLORS.gold,
            letterSpacing: "0.2em",
            fontWeight: 700,
          }}>
            NOUVELLE ÉNERGIE
          </span>
        </div>

        {partnerLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
            <div style={{
              display: "inline-block",
              width: 18,
              height: 18,
              border: `2px solid ${COLORS.border}`,
              borderTopColor: COLORS.gold,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <span style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: "italic" }}>
              Nouvelle Énergie analyse votre mandat...
            </span>
          </div>
        )}

        {!partnerLoading && partnerSummary && (
          <>
            {partnerError && (
              <div style={{
                padding: "8px 12px",
                background: `${COLORS.yellow}15`,
                border: `1px solid ${COLORS.yellow}40`,
                fontSize: 10,
                color: COLORS.yellow,
                marginBottom: 14,
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.1em",
              }}>
                ⚠ TEXTE DE SECOURS — GÉNÉRATION IA INDISPONIBLE
              </div>
            )}
            <div style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 14.5,
              color: COLORS.text,
              lineHeight: 1.7,
              whiteSpace: "pre-line",
            }}>
              {partnerSummary}
            </div>
          </>
        )}

        <div style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <PartnerCTA href="#" label="Rejoindre le groupe WhatsApp" primary />
          <PartnerCTA href="#" label="Participer au prochain échange en ligne" />
          <PartnerCTA href="#" label="Proposer votre idée pour les 100 jours" />
        </div>
      </div>

    {/* ═══ BLOC QR CODE NOUVELLE ÉNERGIE ═══ */}
      <SubTag>Découvrir Nouvelle Énergie</SubTag>
      <NouvelleEnergieQRBlock />
          
      <BigButton onClick={onRestart}>Rejouer un autre mandat ↗</BigButton>

      <div style={{ marginTop: 24, padding: 16, background: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}30`, borderLeft: `3px solid ${COLORS.gold}` }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.2em", marginBottom: 8, fontWeight: 600 }}>◊ PROTOTYPE — VERSION DE DÉMONSTRATION</div>
        <p style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.65, margin: 0 }}>
          Chaque dossier est généré en temps réel par Claude. La version finale proposera un mandat complet de 100 jours, des indicateurs vivants, et un comparatif anonymisé entre joueurs.
        </p>
      </div>
    </Section>
  );
}

function classifyFamily(scores, indicators) {
  const { liberal = 0, social = 0, autorite = 0, europe = 0 } = scores;
  const { debt = 115.6, confidence = 52, parliament = 287, tension = 4.2, spread = 64 } = indicators || {};

  // ═══ Étape A : déterminer la famille politique principale (7 catégories nettes) ═══
  const scoreList = [
    { key: "social_radical", value: social >= 4 ? social + 1 : 0, family: "Gauche radicale" },
    { key: "social_dem", value: social >= 2 ? social : 0, family: "Social-démocrate" },
    { key: "ecologiste", value: 0, family: "Écologiste" }, // pas de score "écologie" dans la matrice actuelle
    { key: "autorite", value: autorite >= 3 ? autorite : 0, family: "Conservateur" },
    { key: "national", value: autorite >= 5 ? autorite + 1 : 0, family: "National-populaire" },
    { key: "liberal", value: liberal >= 2 ? liberal : 0, family: "Libéral" },
    { key: "europe", value: europe >= 3 ? europe : 0, family: "Centriste" },
  ];
  scoreList.sort((a, b) => b.value - a.value);
  const top = scoreList[0];
  const family = top.value > 0 ? top.family : "Centriste";

  // ═══ Étape B : déterminer l'adjectif qui pique selon le BILAN réel ═══
  // L'adjectif révèle COMMENT le mandat s'est passé, pas juste l'orientation idéologique.
  let adjective = "";
  if (confidence < 35) adjective = "isolé";
  else if (debt > 119) adjective = "endetté";
  else if (tension > 6) adjective = "contesté";
  else if (parliament < 270) adjective = "fragilisé";
  else if (spread > 80) adjective = "sous pression";
  else if (confidence > 65 && debt > 117) adjective = "généreux";
  else if (confidence > 65) adjective = "rassembleur";
  else if (debt < 114 && confidence < 50) adjective = "rigoureux";
  else adjective = "réformateur";

  // ═══ Étape C : pourcentage (pour effet de rareté / partage) ═══
  const pctMap = {
    "Gauche radicale": 8,
    "Social-démocrate": 17,
    "Écologiste": 11,
    "Centriste": 19,
    "Libéral": 14,
    "Conservateur": 18,
    "National-populaire": 13,
  };
  const pct = pctMap[family] || 14;

  // ═══ Étape D : construire le twist « Vous avez X… mais Y » ═══
  // On choisit le verbe positif selon l'orientation, et la conséquence négative selon l'indicateur le plus dégradé.
  const positives = {
    "Gauche radicale": "refusé les cadres imposés",
    "Social-démocrate": "apaisé le pays",
    "Écologiste": "préparé la transition",
    "Centriste": "tenu votre ligne",
    "Libéral": "libéré l'économie",
    "Conservateur": "rétabli l'autorité",
    "National-populaire": "parlé fort à la nation",
  };

  // Trouver la conséquence négative la plus marquante
  const negatives = [];
  if (debt > 118) negatives.push({ score: debt - 118, label: "fait exploser la dette" });
  if (confidence < 40) negatives.push({ score: 40 - confidence, label: "perdu la confiance du pays" });
  if (parliament < 275) negatives.push({ score: 275 - parliament, label: "perdu votre majorité" });
  if (tension > 5.5) negatives.push({ score: tension * 10, label: "embrasé la rue" });
  if (spread > 80) negatives.push({ score: spread - 80, label: "fait fuir les marchés" });
  if (europe < -2) negatives.push({ score: -europe, label: "isolé la France à Bruxelles" });

  let negative;
  if (negatives.length > 0) {
    negatives.sort((a, b) => b.score - a.score);
    negative = negatives[0].label;
  } else {
    // Si rien n'est dramatiquement négatif, on fait quand même un twist nuancé
    if (liberal > social) negative = "déçu les classes populaires";
    else if (social > liberal) negative = "alarmé Bercy";
    else negative = "laissé le pays sans cap clair";
  }

  const positiveVerb = positives[family] || "tenu le cap";
  const shareQuote = `Vous avez ${positiveVerb}… mais ${negative}.`;

  // ═══ Étape E : tagline plus longue pour la page de profil ═══
  const taglines = {
    "Gauche radicale": "Vous avez refusé les cadres. Vous avez gouverné à contre-courant.",
    "Social-démocrate": "Vous croyez à la justice sociale et au compromis comme méthode.",
    "Écologiste": "Vous avez fait passer la transition avant tout le reste.",
    "Centriste": "Vous gouvernez par l'équilibre. Ni rupture, ni dogme.",
    "Libéral": "Vous croyez au marché, à la concurrence, à la responsabilité individuelle.",
    "Conservateur": "Vous gouvernez par la fermeté. L'autorité avant le débat.",
    "National-populaire": "Vous avez parlé au pays réel, au-dessus des élites.",
  };

  return {
    label: `${family} ${adjective}`,
    shortLabel: family,
    adjective,
    closeTo: "", // plus utilisé, on garde vide pour compatibilité
    tagline: taglines[family] || "Vous avez gouverné sans étiquette idéologique fixe.",
    shareQuote,
    pct,
  };
}

function Section({ children }) { return <div style={{ padding: "8px 0" }}>{children}</div>; }
function Tag({ children }) { return <div style={{ fontSize: 11, color: COLORS.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>{children}</div>; }
function SubTag({ children }) { return <div style={{ fontSize: 11, color: COLORS.textDim, letterSpacing: "0.2em", textTransform: "uppercase", margin: "22px 0 14px", fontWeight: 600 }}>{children}</div>; }

function Sources({ children }) {
  return <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textDim, lineHeight: 1.8 }}>{children}</div>;
}

function ExecutiveSummary({ children }) {
  return (
    <div style={{ padding: 16, background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.gold}`, marginBottom: 18, boxShadow: `0 1px 3px ${COLORS.navy}08` }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 600 }}>— EXECUTIVE SUMMARY —</div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14, color: COLORS.text, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Dashboard({ indicators, highlight }) {
  return (
    <div style={{ background: COLORS.bgPanel, padding: "14px 16px", marginBottom: 20, border: `1px solid ${highlight ? COLORS.gold : COLORS.border}`, boxShadow: `0 1px 3px ${COLORS.navy}08` }}>
      <Tag>État de la nation</Tag>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 1, background: COLORS.border, marginTop: 4 }}>
        <Stat label="Dette" value={`${indicators.debt}%`} />
        <Stat label="Confiance" value={`${indicators.confidence}%`} />
        <Stat label="AN" value={`${indicators.parliament}`} />
        <Stat label="Tension" value={`${indicators.tension}/10`} />
        <Stat label="Spread" value={`${indicators.spread} pb`} />
      </div>
    </div>
  );
}

function Stat({ label, value, note }) {
  return (
    <div style={{ background: COLORS.bgPanel, padding: "11px 11px" }}>
      <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 17, color: COLORS.navy, marginTop: 4, fontWeight: 600 }}>{value}</div>
      {note && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 3 }}>{note}</div>}
    </div>
  );
}

function ShareStat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "#a8a8a0", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 16, color: COLORS.textOnDark, marginTop: 3, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function AgentsGrid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, marginBottom: 16 }}>{children}</div>;
}

function Agent({ name, color, stance, quote }) {
  return (
    <div style={{ padding: "12px 14px", background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${color}`, boxShadow: `0 1px 2px ${COLORS.navy}05` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>{name}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color, letterSpacing: "0.05em", fontWeight: 600 }}>{stance}</span>
      </div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 12.5, fontStyle: "italic", color: COLORS.textMuted, lineHeight: 1.5 }}>« {quote} »</div>
    </div>
  );
}

function ScenarioButton({ code, color, title, risk, desc, tags, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: COLORS.bgPanel, border: `1px solid ${color}50`, borderLeft: `3px solid ${color}`, color: COLORS.text, cursor: "pointer", marginBottom: 10, fontFamily: "inherit", transition: "all 0.2s", boxShadow: `0 1px 3px ${COLORS.navy}08` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}06`; e.currentTarget.style.transform = "translateX(2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.navy}12`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.background = COLORS.bgPanel; e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = `0 1px 3px ${COLORS.navy}08`; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7, flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color, letterSpacing: "0.1em", fontWeight: 700 }}>{code}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{title}</span>
        </div>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: COLORS.textDim, fontWeight: 600 }}>{risk}</span>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 8 }}>{desc}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, fontFamily: "ui-monospace, monospace", fontSize: 10 }}>
          {tags.map((t, i) => (
            <span key={i} style={{ padding: "3px 8px", background: t.positive === true ? `${COLORS.green}15` : t.positive === false ? `${COLORS.red}12` : `${COLORS.yellow}15`, color: t.positive === true ? COLORS.green : t.positive === false ? COLORS.red : COLORS.yellow, fontWeight: 600 }}>{t.label}</span>
          ))}
        </div>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color, fontWeight: 600, letterSpacing: "0.1em" }}>EN SAVOIR + →</span>
      </div>
    </button>
  );
}

function Timeline({ events }) {
  return (
    <div style={{ paddingLeft: 20, borderLeft: `1px solid ${COLORS.gold}40`, margin: "0 0 24px" }}>
      {events.map((e, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: 16 }}>
          <span style={{ position: "absolute", left: -25, top: 4, width: 9, height: 9, background: resolveColor(e.color), border: `2px solid ${COLORS.bg}` }}></span>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: resolveColor(e.color), letterSpacing: "0.15em", marginBottom: 4, fontWeight: 600 }}>JOUR {e.day}</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13.5, color: COLORS.navy, lineHeight: 1.5 }}>{e.label}</div>
        </div>
      ))}
    </div>
  );
}

function BigButton({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", padding: "16px 22px", background: COLORS.navy, border: "none", color: COLORS.textOnDark, fontFamily: "ui-monospace, monospace", fontSize: 13, letterSpacing: "0.2em", cursor: "pointer", textTransform: "uppercase", fontWeight: 600, transition: "all 0.2s", boxShadow: `0 4px 12px ${COLORS.navy}30` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.navyLight; e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.navy}40`; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.navy; e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.navy}30`; e.currentTarget.style.transform = "translateY(0)"; }}>
      {children}
    </button>
  );
}

function delta(d) {
  if (Math.abs(d) < 0.05) return "— stable";
  const sign = d > 0 ? "▲" : "▼";
  return `${sign} ${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}
function PartnerCTA({ href, label, primary }) {
  const handleClick = () => {
    track("cta_clicked", { label });
  };
  return (
    <a href={href} onClick={handleClick} style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      border: `1px solid ${primary ? COLORS.gold : COLORS.border}`,
      background: primary ? `${COLORS.gold}08` : "transparent",
      color: primary ? COLORS.gold : COLORS.navy,
      textDecoration: "none",
      fontSize: 13.5,
      fontWeight: 600,
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = primary ? `${COLORS.gold}15` : `${COLORS.gold}06`;
      e.currentTarget.style.borderColor = COLORS.gold;
      e.currentTarget.style.color = COLORS.gold;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = primary ? `${COLORS.gold}08` : "transparent";
      e.currentTarget.style.borderColor = primary ? COLORS.gold : COLORS.border;
      e.currentTarget.style.color = primary ? COLORS.gold : COLORS.navy;
    }}>
      <span>{label}</span>
      <span style={{ fontSize: 16 }}>→</span>
    </a>
  );
}

// ============================================================
// COMPOSANT OPT-IN EMAIL
// ============================================================
function OptInForm({ sessionId, family }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Adresse email invalide.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const response = await fetch("/api/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email: trimmed }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${response.status}`);
      }
      track("email_submitted", { family: family.shortLabel });
      setStatus("success");
    } catch (err) {
      console.error("Opt-in error:", err);
      setStatus("error");
      setErrorMsg("Impossible d'enregistrer. Réessayez dans un instant.");
    }
  };

  if (status === "success") {
    return (
      <div style={{
        background: `${COLORS.green}08`,
        border: `1px solid ${COLORS.green}40`,
        borderLeft: `3px solid ${COLORS.green}`,
        padding: "20px 22px",
        marginBottom: 26,
      }}>
        <div style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 10,
          color: COLORS.green,
          letterSpacing: "0.2em",
          fontWeight: 700,
          marginBottom: 10,
        }}>
          ◊ ENREGISTRÉ
        </div>
        <div style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 16,
          color: COLORS.navy,
          lineHeight: 1.55,
          marginBottom: 6,
          fontWeight: 600,
        }}>
          Votre bilan vous attendra dans votre boîte mail.
        </div>
        <div style={{
          fontSize: 13,
          color: COLORS.textMuted,
          lineHeight: 1.55,
        }}>
          Vous recevrez votre profil de président et l'analyse détaillée de votre mandat. Vos données restent confidentielles.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.bgPanel,
      border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${COLORS.gold}`,
      padding: "20px 22px",
      marginBottom: 26,
      boxShadow: `0 2px 6px ${COLORS.navy}06`,
    }}>
      <div style={{
        fontFamily: "ui-serif, Georgia, serif",
        fontSize: 16,
        color: COLORS.navy,
        lineHeight: 1.5,
        marginBottom: 14,
        fontWeight: 600,
      }}>
        Recevez votre profil de président par email.
      </div>
      <div style={{
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 1.55,
        marginBottom: 18,
      }}>
        Votre famille politique, vos décisions, vos indicateurs finaux et une analyse de votre mandat.
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#fff",
              border: `1px solid ${status === "error" ? COLORS.red : COLORS.border}`,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 14,
              color: COLORS.navy,
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.navy; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = status === "error" ? COLORS.red : COLORS.border; }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "14px 18px",
              background: COLORS.navy,
              border: "none",
              color: COLORS.textOnDark,
              fontFamily: "ui-monospace, monospace",
              fontSize: 12,
              letterSpacing: "0.2em",
              cursor: status === "loading" ? "wait" : "pointer",
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: status === "loading" ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {status === "loading" ? "Enregistrement..." : "Mes 100 jours à l'Élysée →"}
          </button>
        </div>
      </form>

      {status === "error" && errorMsg && (
        <div style={{
          marginTop: 10,
          fontSize: 12,
          color: COLORS.red,
          fontStyle: "italic",
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{
        marginTop: 12,
        fontSize: 11,
        color: COLORS.textDim,
        fontStyle: "italic",
      }}>
        Vos données restent confidentielles. Pas de spam, jamais.
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT QR CODE NOUVELLE ÉNERGIE
// ============================================================
function NouvelleEnergieQRBlock() {
  const url = "https://www.unenouvelleenergie.fr/";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=0a1a3a&bgcolor=ffffff&margin=10`;

  return (
    <div style={{
      background: COLORS.bgPanel,
      border: `1px solid ${COLORS.border}`,
      borderTop: `3px solid ${COLORS.gold}`,
      padding: "22px 22px",
      marginBottom: 26,
      display: "flex",
      gap: 20,
      alignItems: "center",
      boxShadow: `0 2px 8px ${COLORS.navy}08`,
    }}>
      <div style={{
        flexShrink: 0,
        width: 110,
        height: 110,
        background: "#fff",
        padding: 4,
        border: `1px solid ${COLORS.border}`,
      }}>
        <img
          src={qrUrl}
          alt="QR code vers le site Nouvelle Énergie"
          width="100%"
          height="100%"
          style={{ display: "block" }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 10,
          color: COLORS.gold,
          letterSpacing: "0.2em",
          fontWeight: 700,
          marginBottom: 6,
        }}>
          NOUVELLE ÉNERGIE
        </div>
        <div style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 16,
          color: COLORS.navy,
          lineHeight: 1.4,
          marginBottom: 8,
          fontWeight: 600,
        }}>
          Scannez pour découvrir notre vision.
        </div>
        
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_clicked", { label: "QR site Nouvelle Énergie" })}
          style={{
            fontSize: 12,
            color: COLORS.gold,
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          unenouvelleenergie.fr →
        </a>
      </div>
    </div>
  );
}
