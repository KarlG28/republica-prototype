"use client";

import { useState, useMemo } from "react";

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

  async function generateDossier() {
    const previousTitles = dossiers.map(d => d.title);
    setLoadingMessage("Claude rédige votre prochain dossier...");
    setSection(SECTIONS.loading);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousTitles }),
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

  const goToIntro = () => setSection(SECTIONS.intro);
  const startSession = () => { setCurrentIdx(0); generateDossier(); };

  const selectScenario = (idx) => {
    setSelectedScenarioIdx(idx);
    setSection(SECTIONS.scenarioDetail);
  };

  const confirmChoice = () => {
    const dossier = dossiers[currentIdx];
    const scenario = dossier.scenarios[selectedScenarioIdx];
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
      setSection(SECTIONS.profile);
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
            <Profile choices={choices} dossiers={dossiers} indicators={indicators} scores={scores} onRestart={restart} />
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
        .republica-fade-in { animation: fadeInUp 0.5s ease-out; }
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

      {/* ═══ BANDEAU TIMER en haut ═══ */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        background: isUrgent ? `${COLORS.red}10` : "transparent",
        border: `1px solid ${isUrgent ? COLORS.red : COLORS.border}`,
        borderRadius: 4,
        marginBottom: 18,
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.18em",
      }}>
        <span style={{ color: COLORS.textDim }}>
          {isUrgent ? "⚠ URGENCE ÉLYSÉE" : `JOUR ${dossier.day || "?"}`} · MANDAT EN COURS
        </span>
        <span style={{
          color: isUrgent ? COLORS.red : COLORS.navy,
          fontWeight: 700,
        }}>
          VOUS AVEZ {timer}
        </span>
      </div>

      {/* ═══ BLOC 1 : CE QUI SE PASSE ═══ */}
      <div style={{
        border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${isUrgent ? COLORS.red : COLORS.navy}`,
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

function Profile({ choices, dossiers, indicators, scores, onRestart }) {
  const family = useMemo(() => classifyFamily(scores), [scores]);
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

      <SubTag>Carte de partage · #MES100JOURS</SubTag>
      <div style={{ background: `linear-gradient(140deg, ${COLORS.navy} 0%, ${COLORS.bgDarker} 100%)`, border: `1px solid ${COLORS.gold}40`, padding: "26px 22px", position: "relative", overflow: "hidden", marginBottom: 26, color: COLORS.textOnDark, boxShadow: `0 8px 24px ${COLORS.navy}30` }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontFamily: "ui-serif, Georgia, serif", fontSize: 150, color: `${COLORS.gold}12`, fontWeight: 600, lineHeight: 1 }}>R</div>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.25em", marginBottom: 14, fontWeight: 600 }}>REPUBLICA · MES 100 JOURS</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 20, fontWeight: 500, color: COLORS.textOnDark, lineHeight: 1.2 }}>J'ai gouverné en</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 26, fontWeight: 600, color: COLORS.gold, lineHeight: 1.1, fontStyle: "italic", marginBottom: 16 }}>{family.shortLabel}</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13.5, color: "#e0dcd3", lineHeight: 1.6, fontStyle: "italic", padding: "12px 0", borderTop: `1px solid ${COLORS.gold}30`, borderBottom: `1px solid ${COLORS.gold}30`, marginBottom: 14 }}>« {family.shareQuote} »</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <ShareStat label="CONFIANCE" value={`${indicators.confidence}%`} />
            <ShareStat label="DETTE" value={`${indicators.debt}%`} />
            <ShareStat label="FAMILLE" value={`${family.pct}%`} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: `1px solid #ffffff15`, fontFamily: "ui-monospace, monospace", fontSize: 10, color: "#a8a8a0", letterSpacing: "0.15em" }}>
            <span>REPUBLICA.FR · ET TOI ?</span>
            <span style={{ color: COLORS.gold }}>#MES100JOURS</span>
          </div>
        </div>
      </div>

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

function classifyFamily(scores) {
  const { liberal = 0, social = 0, autorite = 0, europe = 0 } = scores;
  const max = Math.max(liberal, social, autorite, europe);
  if (max === 0) return { label: "Centre · indéterminé", shortLabel: "Centriste", closeTo: "Tradition modérée", tagline: "Vous gouvernez par équilibre. Ni rupture, ni constance idéologique.", shareQuote: "J'ai cherché le compromis. Toujours.", pct: 11 };
  if (autorite === max && autorite >= 3) return { label: "Droite conservatrice", shortLabel: "Droite conservatrice", closeTo: "Tradition gaulliste régalienne", tagline: "Vous gouvernez par la fermeté. Votre boussole : l'autorité, la responsabilité, le refus du compromis perçu comme faiblesse.", shareQuote: "J'ai tranché, j'ai assumé. Le pays plie, il ne se rompt pas.", pct: 22 };
  if (social === max && social >= 4) return { label: "Gauche radicale · contestataire", shortLabel: "Gauche radicale", closeTo: "Tradition contestataire", tagline: "Vous refusez les cadres imposés. La justice avant tout.", shareQuote: "J'ai refusé les cadres. J'ai gouverné à contre-courant.", pct: 9 };
  if (social === max && social >= 2) return { label: "Centre-gauche · réformiste social", shortLabel: "Centre-gauche social", closeTo: "Tradition rocardienne", tagline: "Vous croyez à la justice sociale comme moteur du progrès.", shareQuote: "J'ai investi dans le pays. La dette monte, mais la France se reconstruit.", pct: 14 };
  if (europe === max && europe >= 3) return { label: "Centre · social-européen", shortLabel: "Centre social-européen", closeTo: "Sociale-démocratie réformiste", tagline: "Vous croyez à la négociation comme méthode et à l'Europe comme cadre.", shareQuote: "J'ai négocié, j'ai européanisé. Le pays avance sans se déchirer.", pct: 16 };
  if (liberal === max && liberal >= 4) return { label: "Droite libérale décomplexée", shortLabel: "Droite libérale", closeTo: "Tradition libérale-conservatrice", tagline: "Vous croyez au marché, à la concurrence, à la responsabilité individuelle.", shareQuote: "J'ai libéré ce qui devait l'être. Tant pis pour les rentes.", pct: 13 };
  if (liberal === max && liberal >= 2) return { label: "Centre-droit · libéral européen", shortLabel: "Centre-droit libéral", closeTo: "Macronisme première manière", tagline: "Vous croyez à la rigueur budgétaire et à l'ouverture économique.", shareQuote: "Réforme structurelle et discipline. J'ai assumé les deux.", pct: 19 };
  if (europe >= 2 && liberal >= 1) return { label: "Centre · technocratique", shortLabel: "Centre technocratique", closeTo: "Tradition giscardienne", tagline: "Vous croyez à la méthode plus qu'à la rupture.", shareQuote: "Pas de feuilleton, juste des résultats.", pct: 12 };
  return { label: "Centre · pragmatique", shortLabel: "Centre pragmatique", closeTo: "Tradition modérée française", tagline: "Vous gouvernez sans étiquette idéologique fixe.", shareQuote: "J'ai pris chaque décision pour ce qu'elle valait.", pct: 14 };
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
