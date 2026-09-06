"use client";

import { useState, useMemo, useEffect, useRef } from "react";

// Charger Inter depuis Google Fonts en V2 Acid Pop
if (typeof document !== "undefined" && !document.querySelector('link[data-inter]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
  link.setAttribute('data-inter', 'true');
  document.head.appendChild(link);
}

// ============================================================
// MOI PRÉSIDENT(E) - PROTOTYPE
// Génération IA en temps réel : 4 décisions par session
// ============================================================

const COLORS = {
  // ═══ V2 ACID POP ═══
  // Fonds : dégradé magenta → violet
  bgGradient: "linear-gradient(180deg, #FF2E93 0%, #B026FF 100%)",
  bgGradientReverse: "linear-gradient(180deg, #B026FF 0%, #FF2E93 100%)",
  magenta: "#FF2E93",
  violet: "#B026FF",
  lime: "#D6FF00",
  // Texte
  ink: "#14121A",            // texte sur fond clair (cartes blanches)
  inkSoft: "#5C5266",        // texte secondaire sur cartes
  white: "#FFFFFF",
  whiteSoft: "rgba(255,255,255,0.85)",
  whiteDim: "rgba(255,255,255,0.6)",
  // Couleurs archétypes (un par profil)
  archReformateur: "#00E5FF",
  archLiberal: "#D6FF00",
  archProgressiste: "#FF2E93",
  archConservateur: "#FF6B35",
  archReac: "#8B4513",
  archIdentitaire: "#1A1A4E",
  // Alias rétrocompatibles (pour ne pas casser les composants V1)
  bg: "#FF2E93",
  bgPanel: "#FFFFFF",
  bgDark: "#14121A",
  navy: "#14121A",
  navyLight: "#5C5266",
  gold: "#D6FF00",
  goldDim: "#B5D900",
  goldLight: "#D6FF00",
  text: "#14121A",
  textBright: "#14121A",
  textMuted: "#5C5266",
  textDim: "rgba(20,18,26,0.6)",
  textOnDark: "#FFFFFF",
  border: "rgba(20,18,26,0.12)",
  red: "#FF2E93",
  redLight: "#FF6BAE",
  green: "#3ACB72",
  blue: "#B026FF",
  yellow: "#D6FF00",
};

// Image de fond : Élysée stylisé (uploadé dans public/elysee.png)
const BG_IMAGE = "/elysee.png";

const SECTIONS = {
  welcome: "welcome",
  intro: "intro",
  loading: "loading",
  dossier: "dossier",
  scenarioDetail: "scenarioDetail",
  consequence: "consequence",
  profile: "profile",
};
const TOTAL_DECISIONS = 1;

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

// Conjugue un mot au genre inclusif (forme "réformateur(rice)", "libéral(e)", etc.)
function genderInclusive(word) {
  if (!word) return word;
  const w = word.trim();
  const lower = w.toLowerCase();
  // Terminaisons déjà épicènes (pas de modification)
  if (/(iste|aire|able|ible|ique|isme|esse|euse|trice|enne|ette)$/i.test(lower)) return w;
  // Mots déjà finissant par "e" (la plupart sont épicènes)
  if (/e$/i.test(lower)) return w;
  // "-eur" → ajoute "(rice)"
  if (/eur$/i.test(lower)) return w + "(rice)";
  // "-if" → ajoute "(ve)"
  if (/if$/i.test(lower)) return w + "(ve)";
  // "-l" → ajoute "(le)" (libéral → libéral(e), national → national(e))
  if (/al$/i.test(lower)) return w + "(e)";
  // Cas général : ajoute "(e)"
  return w + "(e)";
}

// Convertit une phrase à la 2ème personne en 1ère personne (pour la carte téléchargée)
function toFirstPerson(text) {
  if (!text) return text;
  let t = text;
  // Substitutions ordonnées : du plus spécifique au plus général
  t = t.replace(/Vous avez/gi, "J'ai");
  t = t.replace(/vous avez/gi, "j'ai");
  t = t.replace(/Vous êtes/gi, "Je suis");
  t = t.replace(/vous êtes/gi, "je suis");
  t = t.replace(/Vous /g, "Je ");
  t = t.replace(/ vous /g, " je ");
  t = t.replace(/Votre /g, "Ma ");
  t = t.replace(/ votre /g, " ma ");
  t = t.replace(/Vos /g, "Mes ");
  t = t.replace(/ vos /g, " mes ");
  return t;
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

const FALLBACK_PARTNER_SUMMARY = `Vous avez gouverné quatre décisions sous tension. Voici comment Nouvelle Énergie aurait abordé ces mêmes choix.

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
  const [scores, setScores] = useState({ liberal: 0, social: 0, autorite: 0, europe: 0, progressisme: 0 });
  const [loadingMessage, setLoadingMessage] = useState("");
  const [generationError, setGenerationError] = useState(null);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(null);
  // Fixé au démarrage : à quel dossier l'urgence aura lieu (2 ou 3 sur 5)
 // Pas de notion d'urgence aléatoire en V2 : on a 1 seul dilemme
  const urgentDossierIdx = -1;
  // Préchargement du 1er dossier pendant l'écran Intro
  const [preloadedDossier, setPreloadedDossier] = useState(null);
  const [preloadingError, setPreloadingError] = useState(null);

  // Conséquences générées en parallèle pour chaque dossier
  // Structure : { 0: { A: {...}, B: {...}, C: {...} }, 1: {...}, ... }
  const [consequencesByDossier, setConsequencesByDossier] = useState({});

  // Quand le préchargement arrive ET qu'on est en train de l'attendre (loading sans dossier), bascule auto
  useEffect(() => {
    if (preloadedDossier && section === SECTIONS.loading && dossiers.length === 0) {
      setDossiers([preloadedDossier]);
      setSection(SECTIONS.dossier);
    }
  }, [preloadedDossier, section, dossiers.length]);

  // Quand on entre dans un nouveau dossier, on lance la génération des 3 conséquences en parallèle
  useEffect(() => {
    if (section === SECTIONS.dossier && dossiers[currentIdx] && !consequencesByDossier[currentIdx]) {
      generateConsequencesForDossier(currentIdx, dossiers[currentIdx]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, currentIdx, dossiers]);

  // Quand les conséquences arrivent ET qu'on est en train de les attendre (loading après choix), bascule auto
  useEffect(() => {
    if (section === SECTIONS.loading && choices[currentIdx]) {
      const signature = choices[currentIdx];
      const conseq = consequencesByDossier[currentIdx]?.[signature];
      if (conseq) {
        setDossiers(prev => {
          const updated = [...prev];
          if (updated[currentIdx]) {
            updated[currentIdx] = {
              ...updated[currentIdx],
              consequences: { ...(updated[currentIdx].consequences || {}), [signature]: conseq },
            };
          }
          return updated;
        });
        setSection(SECTIONS.consequence);
      }
    }
  }, [consequencesByDossier, section, choices, currentIdx]);

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

    setLoadingMessage(forceUrgent ? "Une crise survient à l'Élysée..." : "L'actu ne dort jamais. Vous non plus d'ailleurs.");
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
      // Forcer la chronologie : tous les dossiers tiennent dans les 100 premiers jours
      const dayMapping = ["J+15", "J+40", "J+70", "J+95", "J+98"];
      newDossier.day = dayMapping[nextIdx] || `J+${20 + nextIdx * 20}`;
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
  
  const goToIntro = () => {
    setSection(SECTIONS.intro);
    // On lance le préchargement du 1er dossier en arrière-plan, pendant la lecture de l'écran d'investiture
    preloadFirstDossier();
  };

  async function preloadFirstDossier() {
    setPreloadingError(null);
    try {
      const forceUrgent = false;
      const response = await fetch("/api/generate-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousTitles: [], forceUrgent }),
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json();
      const dossier = data.dossier;
      if (!dossier || !dossier.title || !dossier.scenarios || dossier.scenarios.length < 2) {
        throw new Error("Format de dossier invalide");
      }
      // Force la chronologie : 1er dossier à J+15
      dossier.day = "J+15";
      setPreloadedDossier(dossier);
    } catch (err) {
      console.error("Erreur préchargement:", err);
      setPreloadingError(err.message);
    }
  }

  async function generateConsequencesForDossier(dossierIdx, dossier) {
    if (!dossier || !dossier.scenarios || dossier.scenarios.length === 0) return;

    // On lance les 3 appels en parallèle
    const promises = dossier.scenarios.map(async (scenario) => {
      try {
        const response = await fetch("/api/generate-consequences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossierTitle: dossier.title || "",
            dossierSubtitle: dossier.subtitle || "",
            scenarioTitle: scenario.title || "",
            scenarioDesc: scenario.desc || "",
            scenarioRisk: scenario.risk || "",
          }),
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        return { signature: scenario.signature, consequence: data.consequence };
      } catch (err) {
        console.error(`Erreur conséquence scénario ${scenario.signature}:`, err);
        // Fallback : on retourne une chronologie minimale
        return {
          signature: scenario.signature,
          consequence: {
            title: scenario.title || "Décision actée",
            narrative: "La décision suit son cours. Les semaines passent, les effets se déploient.",
            events: [
              { day: "+5", label: "Annonce officielle de la décision", color: "blue" },
              { day: "+15", label: "Premières réactions chiffrées dans la presse", color: "yellow" },
              { day: "+30", label: "Réaction d'un acteur tiers concerné", color: "red" },
              { day: "+50", label: "Échos médiatiques et sociaux", color: "green" },
              { day: "+80", label: "Conséquence politique structurante", color: "gold" },
            ]
          }
        };
      }
    });

    const results = await Promise.all(promises);

    // On range les conséquences par signature de scénario
    const byScenario = {};
    results.forEach(r => {
      byScenario[r.signature] = r.consequence;
    });

    setConsequencesByDossier(prev => ({ ...prev, [dossierIdx]: byScenario }));
  }
  
  const startSession = () => {
    track("start_session");
    setCurrentIdx(0);
    if (preloadedDossier) {
      // Cas 1 : le préchargement est terminé, on l'affiche immédiatement
      setDossiers([preloadedDossier]);
      setSection(SECTIONS.dossier);
      track("preload_hit");
    } else if (preloadingError) {
      // Cas 2 : le préchargement a échoué, on relance via le flow classique
      track("preload_miss_error");
      generateDossier();
    } else {
      // Cas 3 : le préchargement est en cours, on affiche le loading et on attend
      track("preload_miss_pending");
      setLoadingMessage("L'actu ne dort jamais. Vous non plus d'ailleurs.");
      setSection(SECTIONS.loading);
      // On attend la fin du préchargement, sans relancer un 2ème appel
    }
  };

  const selectScenario = (idx) => {
    setSelectedScenarioIdx(idx);
    setSection(SECTIONS.scenarioDetail);
  };

const confirmChoice = async () => {
    const dossier = dossiers[currentIdx];
    const scenario = dossier.scenarios[selectedScenarioIdx];
    track("decision_made", { idx: String(currentIdx + 1), urgent: dossier.urgent ? "yes" : "no" });
    const deltas = scenario.deltas || {};
    const signature = scenario.signature;
    setChoices((c) => ({ ...c, [currentIdx]: signature }));
    setIndicators((i) => ({
      debt: +(i.debt + (deltas.debt || 0)).toFixed(1),
      confidence: +Math.max(0, Math.min(100, i.confidence + (deltas.confidence || 0))).toFixed(1),
      parliament: Math.round(i.parliament + (deltas.parliament || 0)),
      tension: +(Math.max(0, Math.min(10, i.tension + (deltas.tension || 0)))).toFixed(1),
      spread: Math.round(i.spread + (deltas.spread || 0)),
    }));
    setScores((s) => ({
      liberal: s.liberal + (deltas.liberal || 0),
      social: s.social + (deltas.social || 0),
      autorite: s.autorite + (deltas.autorite || 0),
      europe: s.europe + (deltas.europe || 0),
      progressisme: s.progressisme + (deltas.progressisme || 0),
    }));
    setSelectedScenarioIdx(null);

    // Si les conséquences sont déjà générées, on injecte dans le dossier et on affiche
    // Sinon, on bascule sur loading et on attend (un useEffect dédié fera la transition)
    if (consequencesByDossier[currentIdx] && consequencesByDossier[currentIdx][signature]) {
      const consequence = consequencesByDossier[currentIdx][signature];
      setDossiers(prev => {
        const updated = [...prev];
        updated[currentIdx] = {
          ...updated[currentIdx],
          consequences: { ...(updated[currentIdx].consequences || {}), [signature]: consequence },
        };
        return updated;
      });
      setSection(SECTIONS.consequence);
    } else {
      // Conséquences pas encore prêtes : on affiche le loading
      setLoadingMessage("Vos décisions se mettent en marche...");
      setSection(SECTIONS.loading);
    }
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
      background: COLORS.bgGradient,
      color: COLORS.white,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: 0,
      margin: 0,
      position: "relative",
    }}>
  

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px 80px", position: "relative", zIndex: 1 }}>
        {section !== SECTIONS.welcome && <Header section={section} currentIdx={currentIdx} total={TOTAL_DECISIONS} />}

        <FadeIn keyProp={section + "-" + currentIdx}>
          {section === SECTIONS.welcome && <Welcome onContinue={goToIntro} />}
          {section === SECTIONS.intro && <Intro onStart={startSession} />}
          {section === SECTIONS.loading && <Loading message={loadingMessage} isUrgent={dossiers.length > 0 ? dossiers[dossiers.length - 1]?.urgent : (dossiers.length === urgentDossierIdx)} />}
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
        .Moi Président(e)-urgent-glow { animation: urgentGlow 2s ease-in-out infinite; }
        .Moi Président(e)-urgent-stripes-top, .Moi Président(e)-urgent-stripes-bottom {
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
        .Moi Président(e)-urgent-blink {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #a83232;
          border-radius: 50%;
          animation: urgentBlink 1.2s ease-in-out infinite;
        }
        .Moi Président(e)-urgent-card {
          animation: urgentShake 0.3s ease-in-out 3, urgentGlow 2s ease-in-out infinite 1s;
        }
        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .Moi Président(e)-cursor {
          display: inline-block;
          margin-left: 2px;
          color: #e6b94f;
          animation: cursorBlink 0.9s steps(2) infinite;
        }
        .Moi Président(e)-carousel::-webkit-scrollbar {
          display: none;
        }
        .Moi Président(e)-carousel {
          /* Indication tactile : on suggère le swipe */
          cursor: grab;
        }
        .republica-carousel:active {
          cursor: grabbing;
        }

        .republica-carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid ${COLORS.border};
          background: rgba(255,255,255,0.95);
          color: ${COLORS.navy};
          font-size: 22px;
          font-weight: 600;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(10,26,58,0.12);
          transition: all 0.2s;
          padding: 0;
          line-height: 1;
        }

        .republica-carousel-arrow:hover {
          background: ${COLORS.navy};
          color: ${COLORS.bg};
          border-color: ${COLORS.navy};
        }

        .republica-carousel-arrow-left {
          left: -12px;
        }

        .republica-carousel-arrow-right {
          right: -12px;
        }

        /* Afficher les flèches uniquement sur écrans larges (desktop) */
        @media (min-width: 768px) {
          .republica-carousel-arrow {
            display: flex;
          }
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
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  return (
    <div style={{ padding: "20px 4px 40px" }}>
      {/* Header logo + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60, padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: COLORS.lime,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.ink,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-1px",
          }}>M</div>
          <span style={{
            color: COLORS.white,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.3px",
          }}>Moi Président(e)</span>
        </div>
        <span style={{
          color: COLORS.whiteSoft,
          fontSize: 11,
          letterSpacing: "1px",
          fontWeight: 500,
        }}>{today}</span>
      </div>

      {/* Badge nouveau sujet */}
      <div style={{
        background: COLORS.lime,
        borderRadius: 32,
        padding: "8px 16px",
        display: "inline-block",
        marginBottom: 22,
        marginLeft: 8,
      }}>
        <span style={{ color: COLORS.ink, fontSize: 13, fontWeight: 500 }}>⚡ Le dossier chaud du jour</span>
      </div>

      {/* Titre principal */}
      <h1 style={{
        fontSize: 56,
        fontWeight: 500,
        color: COLORS.white,
        lineHeight: 0.95,
        margin: "0 0 24px",
        letterSpacing: "-2px",
        padding: "0 8px",
      }}>
        Le sujet chaud<br/>
        <span style={{ color: COLORS.lime }}>du jour.</span>
      </h1>

      {/* Sous-titre */}
            <p style={{
        fontSize: 17,
        color: COLORS.whiteSoft,
        lineHeight: 1.5,
        margin: "0 0 40px",
        padding: "0 8px",
        maxWidth: 360,
      }}>
        Vous avez remporté l'élection présidentielle. Pas le temps de niaiser, il est déjà l'heure de bosser.
      </p>

      {/* Stats du jour */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, padding: "0 8px" }}>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "14px 16px",
          backdropFilter: "blur(8px)",
        }}>
          <p style={{
            fontSize: 11,
            color: COLORS.whiteDim,
            margin: "0 0 4px",
            letterSpacing: "1px",
            fontWeight: 500,
          }}>JOUEURS</p>
          <p style={{
            fontSize: 22,
            color: COLORS.white,
            fontWeight: 500,
            margin: 0,
          }}>2 487</p>
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "14px 16px",
          backdropFilter: "blur(8px)",
        }}>
          <p style={{
            fontSize: 11,
            color: COLORS.whiteDim,
            margin: "0 0 4px",
            letterSpacing: "1px",
            fontWeight: 500,
          }}>DURÉE</p>
          <p style={{
            fontSize: 22,
            color: COLORS.white,
            fontWeight: 500,
            margin: 0,
          }}>2 min</p>
        </div>
      </div>

      {/* CTA principal */}
      <button onClick={onContinue} style={{
        width: "100%",
        background: COLORS.lime,
        color: COLORS.ink,
        border: "none",
        borderRadius: 18,
        padding: "20px 24px",
        fontSize: 17,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: "0 4px 20px rgba(214,255,0,0.4)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(214,255,0,0.55)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(214,255,0,0.4)";
      }}>
        Entrer dans le bureau →
      </button>

      {/* Signature */}
      <p style={{
        textAlign: "center",
        marginTop: 24,
        fontSize: 12,
        color: COLORS.whiteDim,
      }}>
        par <span style={{ color: COLORS.white, fontWeight: 500 }}>Nouvelle Énergie</span>
      </p>
    </div>
  );
}
function Header({ section, currentIdx, total }) {
  const stepLabel = section === SECTIONS.intro ? "AVANT D'ENTRER"
    : section === SECTIONS.profile ? "VERDICT"
    : section === SECTIONS.loading ? "EN COURS..."
    : section === SECTIONS.scenarioDetail ? "APPROFONDISSEMENT"
    : section === SECTIONS.consequence ? "CONSÉQUENCES"
    : "LE SUJET CHAUD";

  // Progression : 0, 1, 2, 3 selon l'étape
  let progress = 0;
  if (section === SECTIONS.intro) progress = 1;
  else if (section === SECTIONS.dossier || section === SECTIONS.scenarioDetail) progress = 2;
  else if (section === SECTIONS.consequence) progress = 3;
  else if (section === SECTIONS.profile) progress = 4;
  else if (section === SECTIONS.loading) progress = 1.5;

  const totalSteps = 4;
  const progressPct = Math.min(1, progress / totalSteps);

  // Path SVG : trait manuscrit irrégulier (bézier avec petits soubresauts)
  // Full path complet du trait de fond
  const fullPath = "M 4,14 C 60,10 120,17 180,12 S 300,15 380,11 S 520,16 600,13 S 720,10 820,15 S 920,12 996,14";
  // Longueur approximative pour l'animation de "dash" progressif
  const pathLength = 1000;
  const drawnLength = pathLength * progressPct;

  return (
    <div style={{ marginBottom: 24, paddingBottom: 6 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-block",
            width: 8,
            height: 8,
            background: COLORS.lime,
            borderRadius: "50%",
          }} />
          <span style={{
            color: COLORS.white,
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}>Moi Président(e)</span>
        </div>
        <span style={{
          color: COLORS.whiteSoft,
          fontSize: 10,
          letterSpacing: "0.15em",
          fontWeight: 600,
        }}>{stepLabel}</span>
      </div>

      {/* Trait manuscrit SVG */}
      <svg
        viewBox="0 0 1000 28"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: 20,
          display: "block",
          overflow: "visible",
        }}
      >
        {/* Trait de fond (fantôme, très pâle) */}
        <path
          d={fullPath}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Trait de progression (noir marker, dessiné jusqu'à progress) */}
        <path
          d={fullPath}
          stroke={COLORS.ink}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${drawnLength} ${pathLength}`}
          style={{
            transition: "stroke-dasharray 0.5s ease-out",
          }}
        />
      </svg>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop: 44, padding: "20px 8px 24px", borderTop: `1px solid ${COLORS.border}`, textAlign: "center" }}>
      <div style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
        color: COLORS.textDim,
        letterSpacing: "0.1em",
        lineHeight: 1.7,
      }}>
       MOI PRÉSIDENT(E) - SIMULATION PROSPECTIVE IA CONÇUE PAR NOUVELLE ENERGIE
      </div>
      <div style={{
        fontFamily: "ui-serif, Georgia, serif",
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 10,
        lineHeight: 1.6,
        fontStyle: "italic",
        maxWidth: 540,
        margin: "10px auto 0",
        padding: "0 12px",
      }}>
        Situations et propositions librement simulées par IA : Moi Président(e) décline toute responsabilité dans l'occurence de ces événements. Sujets, chiffres et personnalités indiqués à titre illustratif.
      </div>
      <div style={{
        marginTop: 16,
        display: "flex",
        justifyContent: "center",
        gap: 20,
        flexWrap: "wrap",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: "0.15em",
        fontWeight: 600,
      }}>
        <a href="/a-propos" style={{ color: COLORS.textDim, textDecoration: "none" }}>À PROPOS</a>
        <a href="/mentions-legales" style={{ color: COLORS.textDim, textDecoration: "none" }}>MENTIONS LÉGALES</a>
        <a href="/confidentialite" style={{ color: COLORS.textDim, textDecoration: "none" }}>CONFIDENTIALITÉ</a>
      </div>
    </div>
  );
}
function Intro({ onStart }) {
  return (
    <div style={{ padding: "20px 4px 40px" }}>
            {/* Titre principal */}
      <h1 style={{
        fontSize: 44,
        fontWeight: 500,
        color: COLORS.white,
        lineHeight: 1.05,
        margin: "20px 0 24px",
        letterSpacing: "-1.5px",
        padding: "0 4px",
      }}>
        <span style={{ color: COLORS.lime }}>Installez-vous.</span>
      </h1>

      {/* Texte intro */}
       <p style={{
        fontSize: 16,
        color: COLORS.whiteSoft,
        lineHeight: 1.55,
        margin: "0 0 28px",
        padding: "0 4px",
      }}>
        Vos équipes n'ont pas dormi : elles ont planché sur un sujet chaud et vous proposent des solutions. À vous de trancher. Vous ne ferez pas que des heureux...
      </p>

      {/* Card "Comment ça se passe" */}
      <div style={{
        background: COLORS.white,
        borderRadius: 22,
        padding: "22px 22px 24px",
        marginBottom: 24,
        boxShadow: "0 8px 24px rgba(20,18,26,0.18)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            background: COLORS.lime,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}>⚡</div>
          <span style={{ color: COLORS.ink, fontSize: 12, fontWeight: 500, letterSpacing: "1px" }}>COMMENT ÇA SE PASSE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { n: "1", text: "Prenez connaissance du contexte" },
            { n: "2", text: "Choisissez entre trois solutions" },
            { n: "3", text: "Observez les conséquences de votre décision" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: COLORS.magenta,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
                fontSize: 14,
                flexShrink: 0,
              }}>{step.n}</div>
              <p style={{
                margin: 0,
                fontSize: 14.5,
                color: COLORS.ink,
                lineHeight: 1.4,
                paddingTop: 4,
              }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{
        fontSize: 12,
        color: COLORS.whiteDim,
        lineHeight: 1.5,
        margin: "0 0 28px",
        padding: "0 4px",
        fontStyle: "italic",
      }}>
        Simulation IA. Conséquences générées par IA. <span style={{ color: COLORS.white, fontStyle: "normal", fontWeight: 500 }}>Aucune partie n'est identique.</span>
      </p>

      {/* CTA principal */}
      <button onClick={onStart} style={{
        width: "100%",
        background: COLORS.lime,
        color: COLORS.ink,
        border: "none",
        borderRadius: 18,
        padding: "20px 24px",
        fontSize: 17,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: "0 4px 20px rgba(214,255,0,0.4)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(214,255,0,0.55)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(214,255,0,0.4)";
      }}>
        Lire le dossier →
      </button>
    </div>
  );
}
function Loading({ message, isUrgent }) {
  // Scènes immersives qui défilent en fade : on est à l'Élysée
  const scenesNormal = [
    "Vous prenez place dans votre bureau à l'Élysée",
    "Le pays attend votre décision",
  ];
  const scenesUrgent = [
    "L'huissier frappe deux fois, il entre sans attendre",
    "Votre directeur de cabinet vous tend un dossier marqué « URGENT »",
    "Les services s'activent dans tout le palais",
    "Une réponse est attendue dans les heures qui viennent",
  ];
  const scenes = isUrgent ? scenesUrgent : scenesNormal;

  const [sceneIdx, setSceneIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const visibleDuration = 2700;
    const fadeDuration = 300;

    const timer = setTimeout(() => {
      setVisible(false);
      const next = setTimeout(() => {
        setSceneIdx((idx) => (idx + 1) % scenes.length);
        setVisible(true);
      }, fadeDuration);
      return () => clearTimeout(next);
    }, visibleDuration);

    return () => clearTimeout(timer);
  }, [sceneIdx, scenes.length]);

  const accentColor = isUrgent ? COLORS.magenta : COLORS.lime;

  return (
    <div style={{ padding: "60px 4px 80px", textAlign: "center", minHeight: 480 }}>
      {/* Badge en cours */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        borderRadius: 32,
        padding: "10px 18px",
        marginBottom: 50,
      }}>
        <span style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: accentColor,
          animation: "pulse 1.4s ease-in-out infinite",
        }} />
        <span style={{
          color: COLORS.white,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "1.5px",
        }}>{isUrgent ? "URGENCE EN COURS" : "ÉLYSÉE EN ACTION"}</span>
      </div>

      {/* Scène immersive en gros */}
      <div style={{
        minHeight: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}>
        <div style={{
          fontSize: 26,
          color: COLORS.white,
          lineHeight: 1.3,
          fontWeight: 500,
          maxWidth: 360,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          letterSpacing: "-0.5px",
        }}>
          {scenes[sceneIdx]}
        </div>
      </div>

      {/* Petits points indicateurs de progression */}
      <div style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
        marginTop: 50,
      }}>
        {scenes.map((_, i) => (
          <div key={i} style={{
            width: i === sceneIdx ? 24 : 6,
            height: 6,
            borderRadius: 3,
            background: i === sceneIdx ? COLORS.lime : "rgba(255,255,255,0.3)",
            transition: "width 0.4s ease, background 0.4s ease",
          }} />
        ))}
      </div>

      {/* Message contextuel optionnel */}
      {message && (
        <div style={{
          fontSize: 11,
          color: COLORS.whiteDim,
          marginTop: 40,
          letterSpacing: "1.5px",
          fontWeight: 500,
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

function DossierView({ dossier, indicators, onSelectScenario, fallbackError }) {
  const isUrgent = dossier.urgent;
  const timer = dossier.timer || "48H";
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" }).toUpperCase();

  return (
    <div style={{ padding: "12px 4px 40px" }}>
      {fallbackError && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          borderRadius: 12,
          fontSize: 11,
          color: COLORS.white,
          marginBottom: 14,
          fontWeight: 500,
          letterSpacing: "0.5px",
        }}>
          ⚠ Génération IA indisponible · Dossier de secours
        </div>
      )}

      {/* ═══ Carte centrale : le dossier ═══ */}
      <div style={{
        background: COLORS.ink,
        borderRadius: 22,
        padding: "20px 22px 22px",
        marginBottom: 22,
        boxShadow: "0 8px 24px rgba(20,18,26,0.3)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Header du dossier */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 8,
        }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              background: isUrgent ? COLORS.magenta : COLORS.lime,
              color: isUrgent ? COLORS.white : COLORS.ink,
              fontSize: 10,
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 20,
              letterSpacing: "1px",
            }}>{isUrgent ? "⚡ URGENT" : today}</span>
            <span style={{
              background: "rgba(255,255,255,0.12)",
              color: COLORS.white,
              fontSize: 10,
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: 20,
              letterSpacing: "1px",
            }}>⏱ {timer}</span>
          </div>
        </div>

        {/* Sujet chaud */}
        <h2 style={{
          fontSize: 26,
          fontWeight: 500,
          color: COLORS.white,
          lineHeight: 1.15,
          margin: "0 0 10px",
          letterSpacing: "-0.5px",
        }}>
          {dossier.title}
        </h2>

        {/* Subtitle */}
        {dossier.subtitle && (
          <p style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.5,
            margin: "0 0 14px",
          }}>
            {renderRich(dossier.subtitle)}
          </p>
        )}

               {/* Acteurs impliqués */}
        {(dossier.agents || []).length > 0 && (
          <div style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}>
            <p style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 500,
              letterSpacing: "1.5px",
              margin: "0 0 10px",
            }}>ACTEURS IMPLIQUÉS</p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}>
              {(dossier.agents || []).slice(0, 4).map((a, i) => (
                <span key={i} style={{
                  fontSize: 11,
                  color: COLORS.white,
                  background: "rgba(255,255,255,0.1)",
                  padding: "5px 10px",
                  borderRadius: 14,
                  fontWeight: 500,
                }}>{a.name}</span>
                           ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Instruction de jeu ═══ */}
      <div style={{
        textAlign: "center",
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: 11,
          color: COLORS.whiteSoft,
          letterSpacing: "2px",
          fontWeight: 500,
        }}>CHOISISSEZ UNE VOIE</span>
      </div>

      {/* ═══ Les 3 cartes scénarios ═══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(dossier.scenarios || []).filter(Boolean).map((scenario, i) => {
          // Couleur d'accent par scénario A/B/C
          const accentColors = [COLORS.lime, COLORS.magenta, COLORS.archReformateur];
          const accent = accentColors[i] || COLORS.lime;
          // Couleur de texte du badge (lisible)
          const accentText = i === 0 ? COLORS.ink : COLORS.white;

          return (
            <button
              key={i}
              onClick={() => onSelectScenario(i)}
              style={{
                background: COLORS.white,
                border: "none",
                borderRadius: 20,
                padding: "16px 18px",
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
                fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: "0 4px 14px rgba(20,18,26,0.18)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 22px rgba(20,18,26,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(20,18,26,0.18)";
              }}
            >
              {/* Barre de couleur à gauche */}
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                background: accent,
              }} />

              <div style={{ paddingLeft: 8 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}>
                  <span style={{
                    background: COLORS.ink,
                    color: accent,
                    fontSize: 10,
                    fontWeight: 500,
                    padding: "3px 9px",
                    borderRadius: 14,
                    letterSpacing: "1px",
                  }}>{scenario.code || `VOIE ${["A","B","C"][i]}`}</span>
                  {scenario.risk && (
                    <span style={{
                      fontSize: 10,
                      color: COLORS.inkSoft,
                      fontWeight: 500,
                      letterSpacing: "0.5px",
                    }}>{scenario.risk}</span>
                  )}
                </div>

                <h3 style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: COLORS.ink,
                  lineHeight: 1.3,
                  margin: "0 0 4px",
                  letterSpacing: "-0.3px",
                }}>
                  {scenario.title}
                </h3>

                <p style={{
                  fontSize: 13,
                  color: COLORS.inkSoft,
                  lineHeight: 1.4,
                  margin: 0,
                }}>
                  {scenario.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioDetail({ dossier, scenarioIdx, onConfirm, onCancel }) {
  const scenario = dossier.scenarios[scenarioIdx];
  const deltas = scenario.deltas || {};

  // Couleur d'accent selon la position du scénario
  const accentColors = [COLORS.lime, COLORS.magenta, COLORS.archReformateur];
  const accent = accentColors[scenarioIdx] || COLORS.lime;
  const accentTextDark = scenarioIdx === 0 ? COLORS.ink : COLORS.white;

  const impacts = [
    { label: "Dette", value: deltas.debt, unit: "pts", inverse: true },
    { label: "Confiance", value: deltas.confidence, unit: "pts" },
    { label: "Assemblée", value: deltas.parliament, unit: "siège", inverse: false, isInt: true },
    { label: "Tension", value: deltas.tension, unit: "/10", inverse: true },
    { label: "Spread", value: deltas.spread, unit: "pb", inverse: true, isInt: true },
  ].filter(i => i.value !== undefined && i.value !== 0);

  return (
    <div style={{ padding: "12px 4px 40px" }}>
      {/* Badge code voie */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "0 4px" }}>
        <span style={{
          background: accent,
          color: accentTextDark,
          fontSize: 11,
          fontWeight: 500,
          padding: "5px 12px",
          borderRadius: 20,
          letterSpacing: "1px",
        }}>{scenario.code || `VOIE ${["A","B","C"][scenarioIdx]}`}</span>
        {scenario.risk && (
          <span style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            color: COLORS.white,
            fontSize: 10,
            fontWeight: 500,
            padding: "4px 10px",
            borderRadius: 20,
            letterSpacing: "1px",
          }}>{scenario.risk}</span>
        )}
      </div>

      {/* Titre du scénario */}
      <h1 style={{
        fontSize: 30,
        fontWeight: 500,
        color: COLORS.white,
        lineHeight: 1.1,
        margin: "0 0 22px",
        letterSpacing: "-1px",
        padding: "0 4px",
      }}>
        {scenario.title}
      </h1>

      {/* Carte description */}
      <div style={{
        background: COLORS.white,
        borderRadius: 20,
        padding: "18px 20px",
        marginBottom: 18,
        boxShadow: "0 6px 20px rgba(20,18,26,0.2)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 5,
          background: accent,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }} />
        <div style={{ paddingLeft: 10 }}>
          <p style={{
            fontSize: 11,
            color: accent === COLORS.lime ? COLORS.inkSoft : accent,
            fontWeight: 500,
            letterSpacing: "1.5px",
            margin: "0 0 8px",
          }}>CONTEXTE DE LA DÉCISION</p>
          <p style={{
            fontSize: 15,
            color: COLORS.ink,
            lineHeight: 1.55,
            margin: 0,
            fontWeight: 400,
          }}>
            {scenario.desc}
          </p>
        </div>
      </div>

      {/* Tags d'effets sur les acteurs */}
      {scenario.tags && scenario.tags.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{
            fontSize: 11,
            color: COLORS.whiteSoft,
            fontWeight: 500,
            letterSpacing: "1.5px",
            margin: "0 0 10px",
            padding: "0 4px",
          }}>EFFETS ATTENDUS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {scenario.tags.map((t, i) => {
              const tag = Array.isArray(t) ? { label: t[0], positive: t[1] } : t;
              const tagBg = tag.positive === true
                ? "rgba(58,203,114,0.95)"
                : tag.positive === false
                ? "rgba(255,46,147,0.95)"
                : "rgba(255,255,255,0.95)";
              const tagText = tag.positive === null ? COLORS.ink : COLORS.white;
              return (
                <span key={i} style={{
                  background: tagBg,
                  color: tagText,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 16,
                }}>{tag.label}</span>
              );
            })}
          </div>
        </div>
      )}

      {/* Impacts chiffrés */}
      {impacts.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <p style={{
            fontSize: 11,
            color: COLORS.whiteSoft,
            fontWeight: 500,
            letterSpacing: "1.5px",
            margin: "0 0 10px",
            padding: "0 4px",
          }}>IMPACT PROJETÉ · GÉNÉRÉ PAR IA</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
            gap: 8,
          }}>
            {impacts.map((imp, i) => {
              const sign = imp.value > 0 ? "+" : "";
              const isGood = imp.inverse ? imp.value < 0 : imp.value > 0;
              const valueColor = isGood ? "#3ACB72" : COLORS.magenta;
              const displayValue = imp.isInt ? Math.round(imp.value) : imp.value;
              return (
                <div key={i} style={{
                  background: COLORS.white,
                  borderRadius: 14,
                  padding: "10px 12px",
                }}>
                  <p style={{
                    fontSize: 10,
                    color: COLORS.inkSoft,
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                  }}>{imp.label}</p>
                  <p style={{
                    fontSize: 16,
                    color: valueColor,
                    fontWeight: 700,
                    margin: 0,
                  }}>{sign}{displayValue} <span style={{ fontSize: 11, fontWeight: 500 }}>{imp.unit}</span></p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Boutons */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10 }}>
        <button onClick={onCancel} style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          color: COLORS.white,
          border: "none",
          borderRadius: 18,
          padding: "18px 20px",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          ← Retour
        </button>
        <button onClick={onConfirm} style={{
          background: COLORS.lime,
          color: COLORS.ink,
          border: "none",
          borderRadius: 18,
          padding: "18px 24px",
          fontSize: 16,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, sans-serif",
          boxShadow: "0 4px 20px rgba(214,255,0,0.4)",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
          Trancher ⚡
        </button>
      </div>
    </div>
  );
}

function ConsequenceView({ dossier, choice, indicators, isLast, onContinue }) {
  const data = dossier.consequences?.[choice];
  if (!data) {
    return (
      <div style={{ padding: "40px 12px", textAlign: "center" }}>
        <p style={{ color: COLORS.white, fontSize: 15, marginBottom: 24 }}>Erreur d'affichage des conséquences.</p>
        <button onClick={onContinue} style={{
          background: COLORS.lime,
          color: COLORS.ink,
          border: "none",
          borderRadius: 18,
          padding: "16px 24px",
          fontSize: 15,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>Continuer →</button>
      </div>
    );
  }

  // Mapping couleur événement → couleur Acid Pop
  const eventColorMap = {
    blue: COLORS.archReformateur,   // cyan
    yellow: COLORS.lime,
    red: COLORS.magenta,
    green: "#3ACB72",
    gold: COLORS.lime,
    muted: COLORS.inkSoft,
  };

  return (
    <div style={{ padding: "12px 4px 40px" }}>
      {/* Badge "DÉCISION ACTÉE" */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: COLORS.lime,
        borderRadius: 32,
        padding: "8px 16px",
        marginBottom: 18,
        marginLeft: 4,
      }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ color: COLORS.ink, fontSize: 12, fontWeight: 500, letterSpacing: "1px" }}>DÉCISION ACTÉE</span>
      </div>

      {/* Titre conséquences */}
      <h1 style={{
        fontSize: 34,
        fontWeight: 500,
        color: COLORS.white,
        lineHeight: 1.05,
        margin: "0 0 18px",
        letterSpacing: "-1.2px",
        padding: "0 4px",
      }}>
        {data.title}
      </h1>

      {/* Narrative en grosse phrase */}
      <p style={{
        fontSize: 17,
        color: COLORS.whiteSoft,
        lineHeight: 1.5,
        margin: "0 0 28px",
        padding: "0 4px",
        fontStyle: "italic",
      }}>
        {data.narrative}
      </p>

      {/* Indicateurs finaux (en gros badges) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
        gap: 6,
        marginBottom: 24,
      }}>
                {[
          { label: "Dette", value: `${indicators.debt}%` },
          { label: "Confiance", value: `${indicators.confidence}%` },
          { label: "Tension", value: `${indicators.tension}/10` },
          { label: "Spread", value: `${indicators.spread}` },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            borderRadius: 14,
            padding: "10px 8px",
            textAlign: "center",
          }}>
            <p style={{
              fontSize: 9,
              color: COLORS.whiteDim,
              fontWeight: 500,
              letterSpacing: "1px",
              margin: "0 0 3px",
              textTransform: "uppercase",
            }}>{stat.label}</p>
            <p style={{
              fontSize: 14,
              color: COLORS.white,
              fontWeight: 500,
              margin: 0,
            }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Section timeline */}
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        textAlign: "center",
        margin: "0 0 14px",
      }}>LES 90 JOURS QUI SUIVENT</p>

      {/* Timeline en cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {(data.events || []).map((e, i) => {
          const eventColor = eventColorMap[e.color] || COLORS.lime;
          return (
            <div key={i} style={{
              background: COLORS.white,
              borderRadius: 18,
              padding: "14px 16px",
              boxShadow: "0 4px 14px rgba(20,18,26,0.15)",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: 5,
                background: eventColor,
              }} />
              <div style={{
                background: eventColor,
                color: COLORS.ink,
                fontSize: 11,
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: 12,
                letterSpacing: "0.5px",
                flexShrink: 0,
                marginLeft: 8,
              }}>J{e.day}</div>
              <p style={{
                fontSize: 14,
                color: COLORS.ink,
                lineHeight: 1.45,
                margin: 0,
                paddingTop: 2,
              }}>{e.label}</p>
            </div>
          );
        })}
      </div>

      {/* Bouton suite */}
      <button onClick={onContinue} style={{
        width: "100%",
        background: COLORS.lime,
        color: COLORS.ink,
        border: "none",
        borderRadius: 18,
        padding: "20px 24px",
        fontSize: 17,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: "0 4px 20px rgba(214,255,0,0.4)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(214,255,0,0.55)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(214,255,0,0.4)";
      }}>
        Voir le verdict →
      </button>
    </div>
  );
}
function Profile({ choices, dossiers, indicators, scores, onRestart, partnerSummary, partnerLoading, partnerError, sessionId, onSaveAnonymous }) {
  const family = useMemo(() => classifyArchetype(dossiers, choices, indicators), [dossiers, choices, indicators]);
  const shareCardRef = useRef(null);

// Couleur signature selon l'archétype + couleur de texte adaptée
  const archColors = {
    "Réformateur": { bg: COLORS.archReformateur, text: COLORS.ink },
    "Libéral":     { bg: COLORS.archLiberal,     text: COLORS.ink },
    "Progressiste":{ bg: COLORS.archProgressiste,text: COLORS.white },
    "Conservateur":{ bg: COLORS.archConservateur,text: COLORS.white },
    "Réac":        { bg: COLORS.archReac,        text: COLORS.white },
    "Identitaire": { bg: COLORS.archIdentitaire, text: COLORS.white },
  };
  const archScheme = archColors[family.shortLabel] || { bg: COLORS.lime, text: COLORS.ink };
  const archColor = archScheme.bg;
  const archText = archScheme.text;

  // Emoji par archétype
  const archEmojis = {
    "Réformateur": "⚡",
    "Libéral": "💼",
    "Progressiste": "🌈",
    "Conservateur": "🏛️",
    "Réac": "⏳",
    "Identitaire": "🇫🇷",
  };
  const archEmoji = archEmojis[family.shortLabel] || "⚡";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    track("share_card_viewed", {
      family: family.shortLabel,
      adjective: family.adjective,
    });
    if (onSaveAnonymous) onSaveAnonymous(family);
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" }).toUpperCase();

  return (
    <div style={{ padding: "12px 4px 40px" }}>
      {/* ═══ Badge VERDICT ═══ */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        borderRadius: 32,
        padding: "8px 16px",
        marginBottom: 18,
        marginLeft: 4,
      }}>
        <span style={{ color: COLORS.white, fontSize: 11, fontWeight: 500, letterSpacing: "2px" }}>VERDICT · {today}</span>
      </div>

      {/* ═══ CARTE VERDICT (la grosse) ═══ */}
      <div style={{
        background: archColor,
        borderRadius: 28,
        padding: "28px 24px 30px",
        marginBottom: 22,
        boxShadow: "0 10px 30px rgba(20,18,26,0.3)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Filigrane emoji énorme en fond */}
        <div style={{
          position: "absolute",
          right: -20,
          bottom: -40,
          fontSize: 180,
          opacity: 0.12,
          pointerEvents: "none",
          lineHeight: 1,
          transform: "rotate(-12deg)",
        }}>{archEmoji}</div>

        <div style={{ position: "relative" }}>
          {/* Header */}
          <p style={{
            fontSize: 11,
            color: archText,
            fontWeight: 700,
            letterSpacing: "2px",
            margin: "0 0 8px",
            opacity: 0.85,
          }}>VOUS AVEZ TRANCHÉ EN</p>

          {/* Archétype en GROS */}
          <h1 style={{
            fontSize: 52,
            fontWeight: 500,
            color: archText,
            lineHeight: 0.95,
            margin: "0 0 6px",
            letterSpacing: "-2.5px",
          }}>{family.shortLabel}</h1>

          {/* Adjectif */}
          <p style={{
            fontSize: 22,
            color: archText,
            fontWeight: 500,
            margin: "0 0 22px",
            opacity: 0.7,
            letterSpacing: "-0.5px",
          }}>{family.adjective}.</p>

          {/* Twist phrase */}
          <div style={{
            background: COLORS.ink,
            borderRadius: 16,
            padding: "16px 18px",
          }}>
            <p style={{
              fontSize: 15,
              color: COLORS.white,
              lineHeight: 1.45,
              margin: 0,
              fontStyle: "italic",
              fontWeight: 400,
            }}>
              « {renderTwist(family.shareQuote)} »
            </p>
          </div>
        </div>
      </div>

      {/* ═══ BOUTON PARTAGER ═══ */}
      <ShareButton shareCardRef={shareCardRef} family={family} />

      {/* ═══ BOUTONS SOCIAUX ═══ */}
      <SocialShareButtons family={family} />

      {/* ═══ CARTE 1080 CACHÉE ═══ */}
      <ShareCardImage family={family} dossiers={dossiers} shareCardRef={shareCardRef} />

      {/* ═══ STATS COMMUNAUTÉ ═══ */}
      <CommunityStats family={family} />

      {/* ═══ INDICATEURS FINAUX ═══ */}
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        margin: "24px 4px 12px",
      }}>LES CONSÉQUENCES À 90 JOURS</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(86px, 1fr))",
        gap: 8,
        marginBottom: 24,
      }}>
          {[
          { label: "Dette/PIB", value: `${indicators.debt}%` },
          { label: "Confiance", value: `${indicators.confidence}%` },
          { label: "Tension", value: `${indicators.tension}/10` },
          { label: "Spread", value: `${indicators.spread}pb` },
        ].map((stat, i) => (
          <div key={i} style={{
            background: COLORS.white,
            borderRadius: 14,
            padding: "10px 8px",
            textAlign: "center",
          }}>
            <p style={{
              fontSize: 9,
              color: COLORS.inkSoft,
              fontWeight: 500,
              letterSpacing: "1px",
              margin: "0 0 4px",
              textTransform: "uppercase",
            }}>{stat.label}</p>
            <p style={{
              fontSize: 16,
              color: COLORS.ink,
              fontWeight: 700,
              margin: 0,
            }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ═══ VOTRE DÉCISION ═══ */}
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        margin: "0 4px 12px",
      }}>VOTRE DÉCISION</p>
      <div style={{ marginBottom: 24 }}>
        {dossiers.map((d, i) => {
          const c = choices[i];
          const sc = d.scenarios?.find(s => s.signature === c);
          return (
            <div key={i} style={{
              background: COLORS.white,
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 8,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: 4,
                background: archColor,
              }} />
              <p style={{
                fontSize: 10,
                color: COLORS.inkSoft,
                fontWeight: 500,
                letterSpacing: "1px",
                margin: "0 0 4px 8px",
              }}>{d.day} · LE SUJET CHAUD</p>
              <p style={{
                fontSize: 14,
                color: COLORS.ink,
                fontWeight: 500,
                margin: "0 0 2px 8px",
                lineHeight: 1.3,
              }}>{d.title}</p>
              <p style={{
                fontSize: 13,
                color: COLORS.inkSoft,
                margin: "0 0 0 8px",
                lineHeight: 1.35,
                fontStyle: "italic",
              }}>→ {sc ? sc.title : "—"}</p>
            </div>
          );
        })}
      </div>

      {/* ═══ BLOC NOUVELLE ÉNERGIE ═══ */}
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        margin: "0 4px 12px",
      }}>UNE AUTRE MANIÈRE DE GOUVERNER ?</p>
      <div style={{
        background: COLORS.white,
        borderRadius: 22,
        padding: "22px 22px",
        marginBottom: 24,
        boxShadow: "0 6px 20px rgba(20,18,26,0.18)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(20,18,26,0.08)",
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: COLORS.magenta,
          }} />
          <span style={{
            fontSize: 11,
            color: COLORS.ink,
            fontWeight: 700,
            letterSpacing: "1.5px",
          }}>NOUVELLE ÉNERGIE</span>
        </div>

        {partnerLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
            <div style={{
              width: 18,
              height: 18,
              border: `2px solid ${COLORS.inkSoft}40`,
              borderTopColor: COLORS.magenta,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <span style={{ fontSize: 13, color: COLORS.inkSoft, fontStyle: "italic" }}>
              Nouvelle Énergie analyse votre mandat...
            </span>
          </div>
        )}

        {!partnerLoading && partnerSummary && (
          <>
            {partnerError && (
              <div style={{
                padding: "8px 12px",
                background: "rgba(255,46,147,0.08)",
                borderRadius: 10,
                fontSize: 10,
                color: COLORS.magenta,
                marginBottom: 12,
                fontWeight: 500,
                letterSpacing: "0.5px",
              }}>
                ⚠ Texte de secours · génération IA indisponible
              </div>
            )}
            <p style={{
              fontSize: 14,
              color: COLORS.ink,
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: "pre-line",
            }}>
              {partnerSummary}
            </p>
          </>
        )}

        <div style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: "1px solid rgba(20,18,26,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <PartnerCTA href="#" label="Rejoindre le groupe WhatsApp" primary />
          <PartnerCTA href="#" label="Participer au prochain échange en ligne" />
          <PartnerCTA href="#" label="Proposer votre idée pour les 100 jours" />
        </div>
      </div>

      {/* ═══ OPT-IN EMAIL ═══ */}
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        margin: "0 4px 12px",
      }}>◊ DECOUVRIR LE DOSSIER CHAUD DU JOUR</p>
      <OptInForm sessionId={sessionId} family={family} />

      {/* ═══ QR CODE NOUVELLE ÉNERGIE ═══ */}
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        margin: "0 4px 12px",
      }}>DÉCOUVRIR NOUVELLE ÉNERGIE</p>
      <NouvelleEnergieQRBlock />

      {/* ═══ BOUTON REJOUER ═══ */}
      <button onClick={onRestart} style={{
        width: "100%",
        background: COLORS.lime,
        color: COLORS.ink,
        border: "none",
        borderRadius: 18,
        padding: "20px 24px",
        fontSize: 17,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: "0 4px 20px rgba(214,255,0,0.4)",
        transition: "transform 0.15s ease",
        marginBottom: 20,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
        Un autre sujet chaud →
      </button>

      {/* ═══ DISCLAIMER PROTOTYPE ═══ */}
      <div style={{
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        padding: "14px 16px",
      }}>
        <p style={{
          fontSize: 10,
          color: COLORS.lime,
          fontWeight: 700,
          letterSpacing: "1.5px",
          margin: "0 0 6px",
        }}>◊ PROTOTYPE</p>
        <p style={{
          fontSize: 12,
          color: COLORS.whiteSoft,
          lineHeight: 1.5,
          margin: 0,
        }}>
          Chaque sujet est généré en temps réel par IA. Revenez demain pour un nouveau sujet chaud.
        </p>
      </div>
    </div>
  );
}

function classifyArchetype(dossiers, choices, indicators) {
  // En V2 : on utilise directement l'archetype du scénario choisi
  // dossiers[0] et choices[0] doivent exister (1 seule décision)
  const dossier = dossiers[0];
  const signature = choices[0];
  let archetype = "Réformateur"; // fallback par défaut

  if (dossier && dossier.scenarios && signature) {
    const scenario = dossier.scenarios.find(s => s.signature === signature);
    if (scenario && scenario.archetype) {
      archetype = scenario.archetype;
    }
  }

  // ═══ Déterminer l'adjectif selon les indicateurs finaux
  const { debt = 115.6, confidence = 52, parliament = 287, tension = 4.2, spread = 64 } = indicators || {};
  let adjective = "";
  if (confidence < 35) adjective = "isolé";
  else if (debt > 119) adjective = "endetté";
  else if (tension > 6) adjective = "contesté";
  else if (parliament < 270) adjective = "fragilisé";
  else if (spread > 80) adjective = "sous pression";
  else if (confidence > 65 && debt > 117) adjective = "généreux";
  else if (confidence > 65) adjective = "rassembleur";
  else if (debt < 114 && confidence < 50) adjective = "rigoureux";
  else adjective = "déterminé";

  // ═══ Pourcentage indicatif par archétype
  const pctMap = {
    "Réformateur": 18,
    "Libéral": 16,
    "Progressiste": 19,
    "Conservateur": 21,
    "Réac": 12,
    "Identitaire": 14,
  };
  const pct = pctMap[archetype] || 15;

  // ═══ Twist : phrase qui résume sous forme de paradoxe
  const positives = {
    "Réformateur": "osé la rupture",
    "Libéral": "fait confiance aux acteurs",
    "Progressiste": "ouvert la société",
    "Conservateur": "tenu votre ligne",
    "Réac": "rétabli l'ordre ancien",
    "Identitaire": "défendu l'identité nationale",
  };
  const negatives = {
    "endetté": "creusé la dette",
    "isolé": "isolé la France",
    "contesté": "déclenché la rue",
    "fragilisé": "perdu votre majorité",
    "sous pression": "fait grimper le spread",
    "généreux": "creusé les comptes publics",
    "rassembleur": "déçu vos alliés",
    "rigoureux": "tendu le pays",
    "déterminé": "déçu vos électeurs",
  };

  const positive = positives[archetype] || "tenu votre cap";
  const negative = negatives[adjective] || "déçu vos électeurs";
  const shareQuote = `Vous avez ${positive}… mais ${negative}.`;

  return {
    shortLabel: archetype,
    adjective,
    pct,
    shareQuote,
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
  const childArray = Array.isArray(children) ? children : [children].filter(Boolean);
  return <Carousel cardWidthPct={85} cardMaxWidth={280}>{childArray}</Carousel>;
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
    <a href={href} onClick={handleClick} target="_blank" rel="noopener noreferrer" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 16px",
      borderRadius: 14,
      background: primary ? COLORS.magenta : "rgba(255,46,147,0.08)",
      color: primary ? COLORS.white : COLORS.ink,
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 500,
      transition: "transform 0.15s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
    }}>
      <span>{label}</span>
      <span style={{ fontSize: 16 }}>→</span>
    </a>
  );
}
function OptInForm({ sessionId, family }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
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
        background: COLORS.lime,
        borderRadius: 22,
        padding: "20px 22px",
        marginBottom: 24,
      }}>
        <p style={{
          fontSize: 11,
          color: COLORS.ink,
          fontWeight: 700,
          letterSpacing: "1.5px",
          margin: "0 0 8px",
        }}>◊ INSCRIT</p>
        <p style={{
          fontSize: 17,
          color: COLORS.ink,
          fontWeight: 500,
          lineHeight: 1.35,
          margin: "0 0 6px",
          letterSpacing: "-0.3px",
        }}>
          Le sujet chaud arrivera chaque matin dans votre boîte mail.
        </p>
        <p style={{
          fontSize: 13,
          color: COLORS.ink,
          opacity: 0.75,
          lineHeight: 1.5,
          margin: 0,
        }}>
          Vos données restent confidentielles. Pas de spam, jamais.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: 22,
      padding: "22px 22px",
      marginBottom: 24,
      boxShadow: "0 6px 20px rgba(20,18,26,0.18)",
    }}>
      <p style={{
        fontSize: 18,
        color: COLORS.ink,
        fontWeight: 500,
        lineHeight: 1.3,
        margin: "0 0 8px",
        letterSpacing: "-0.4px",
      }}>
        Recevoir le sujet chaud chaque matin
      </p>
      <p style={{
        fontSize: 13,
        color: COLORS.inkSoft,
        lineHeight: 1.5,
        margin: "0 0 16px",
      }}>
        Un nouveau sujet chaud dans votre boîte chaque matin.
      </p>

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
              padding: "16px 18px",
              background: "rgba(20,18,26,0.04)",
              border: `2px solid ${status === "error" ? COLORS.magenta : "transparent"}`,
              borderRadius: 14,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 15,
              color: COLORS.ink,
              outline: "none",
              transition: "border-color 0.15s, background 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = COLORS.magenta;
              e.currentTarget.style.background = COLORS.white;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = status === "error" ? COLORS.magenta : "transparent";
              e.currentTarget.style.background = "rgba(20,18,26,0.04)";
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: COLORS.ink,
              border: "none",
              color: COLORS.lime,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              cursor: status === "loading" ? "wait" : "pointer",
              borderRadius: 14,
              opacity: status === "loading" ? 0.6 : 1,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {status === "loading" ? "Enregistrement..." : "S'inscrire →"}
          </button>
        </div>
      </form>

      {status === "error" && errorMsg && (
        <p style={{
          marginTop: 10,
          fontSize: 12,
          color: COLORS.magenta,
          fontStyle: "italic",
          margin: "10px 0 0",
        }}>
          {errorMsg}
        </p>
      )}

      <p style={{
        marginTop: 12,
        fontSize: 11,
        color: COLORS.inkSoft,
        fontStyle: "italic",
        margin: "12px 0 0",
      }}>
        Vos données restent confidentielles. Pas de spam, jamais.
      </p>
    </div>
  );
}

// ============================================================
// COMPOSANT QR CODE NOUVELLE ÉNERGIE
// ============================================================
function NouvelleEnergieQRBlock() {
  const url = "https://www.unenouvelleenergie.fr/";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=14121A&bgcolor=ffffff&margin=10`;

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: 22,
      padding: "22px 22px",
      marginBottom: 24,
      display: "flex",
      gap: 18,
      alignItems: "center",
      boxShadow: "0 6px 20px rgba(20,18,26,0.18)",
    }}>
      <div style={{
        flexShrink: 0,
        width: 100,
        height: 100,
        background: COLORS.white,
        padding: 4,
        borderRadius: 12,
        border: `2px solid ${COLORS.magenta}`,
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
        <p style={{
          fontSize: 10,
          color: COLORS.magenta,
          letterSpacing: "1.5px",
          fontWeight: 700,
          margin: "0 0 6px",
        }}>
          NOUVELLE ÉNERGIE
        </p>
        <p style={{
          fontSize: 16,
          color: COLORS.ink,
          lineHeight: 1.35,
          margin: "0 0 8px",
          fontWeight: 500,
          letterSpacing: "-0.3px",
        }}>
          Scannez pour découvrir notre vision.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_clicked", { label: "QR site Nouvelle Énergie" })}
          style={{
            fontSize: 12,
            color: COLORS.magenta,
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          unenouvelleenergie.fr →
        </a>
      </div>
    </div>
  );
}

// ============================================================
// CARTE DE PARTAGE 1080x1080 — version téléchargeable
// ============================================================
function ShareCardImage({ family, dossiers, shareCardRef }) {
  const url = "https://www.unenouvelleenergie.fr/";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&color=0a1a3a&bgcolor=ffffff&margin=0`;
  const nbCrises = dossiers.filter(d => d.urgent).length;
  const quote = toFirstPerson(family.shareQuote);
  // Découpe pour mettre la partie après "mais" en rouge
  const match = quote.match(/^(.+?)(\.\.\.|…)\s*mais\s+(.+)$/i);

  return (
    <div ref={shareCardRef} style={{
      position: "absolute",
      left: "-9999px",
      top: 0,
      width: 1080,
      height: 1080,
      background: "#fafaf7",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Filigrane R rouge en arrière-plan */}
      <div style={{
        position: "absolute",
        top: -80,
        right: -60,
        fontFamily: "Georgia, serif",
        fontSize: 760,
        color: "rgba(230, 70, 50, 0.06)",
        fontWeight: 600,
        lineHeight: 1,
        fontStyle: "italic",
        pointerEvents: "none",
      }}>R</div>

      {/* Top : logo + QR */}
      <div style={{ position: "absolute", top: 56, left: 64, right: 64, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#e63946",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Georgia, serif", fontSize: 40, color: "#fafaf7",
            fontWeight: 600, fontStyle: "italic",
          }}>R</div>
          <div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 20, color: "#0a1a3a", letterSpacing: "0.2em", fontWeight: 700, lineHeight: 1 }}>Moi Président(e)</div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 14, color: "rgba(10,26,58,0.5)", letterSpacing: "0.15em", marginTop: 8 }}>LE BILAN</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ width: 120, height: 120, background: "#fff", padding: 8, border: "1px solid rgba(10,26,58,0.1)" }}>
            <img src={qrUrl} alt="" width="100%" height="100%" style={{ display: "block" }} crossOrigin="anonymous" />
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#e63946", letterSpacing: "0.15em", fontWeight: 700 }}>NOUVELLE ÉNERGIE</div>
        </div>
      </div>

      {/* Bloc principal : famille politique */}
      <div style={{ position: "absolute", top: 290, left: 96, right: 96 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: "#e6b94f", letterSpacing: "0.28em", fontWeight: 700, marginBottom: 24 }}>
          J'AI TRANCHÉ EN
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 128, fontWeight: 600, color: "#0a1a3a", lineHeight: 0.95, letterSpacing: "-0.025em", marginBottom: 8 }}>
          {family.shortLabel}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 112, fontWeight: 600, color: "#e63946", lineHeight: 0.95, fontStyle: "italic", letterSpacing: "-0.02em" }}>
          {family.adjective}.
        </div>
      </div>

      {/* Twist en gros avec bordure rouge */}
      <div style={{ position: "absolute", top: 730, left: 96, right: 96, paddingLeft: 32, borderLeft: "8px solid #e63946" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 44, color: "#0a1a3a", lineHeight: 1.35, fontStyle: "italic", fontWeight: 500 }}>
          {match ? (
            <>
              « {match[1]}{match[2]} mais{" "}
              <span style={{ color: "#e63946", fontWeight: 700 }}>{match[3].replace(/\.$/, "")}</span>. »
            </>
          ) : (
            <>« {quote} »</>
          )}
        </div>
      </div>

      {/* Séparateur */}
      <div style={{ position: "absolute", bottom: 180, left: 96, right: 96, height: 1, background: "rgba(10,26,58,0.15)" }} />

      {/* Stats + signature */}
      <div style={{ position: "absolute", bottom: 100, left: 96, right: 96, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: "#0a1a3a", letterSpacing: "0.18em", fontWeight: 700 }}>
          {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" }).toUpperCase()}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: "#e6b94f", letterSpacing: "0.18em", fontWeight: 700 }}>
          Moi Président(e).FR
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 44, left: 96, right: 96, textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 18, color: "rgba(10,26,58,0.4)", letterSpacing: "0.3em", fontWeight: 600 }}>
        #VOTREBILAN
      </div>
    </div>
  );
}

function ShareButton({ shareCardRef, family }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleClick = async () => {
    if (status === "generating") return;
    setStatus("generating");
    setErrorMsg("");

    try {
      if (typeof window.html2canvas === "undefined") {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      }

      if (!shareCardRef.current) {
        throw new Error("Carte introuvable");
      }

      const canvas = await window.html2canvas(shareCardRef.current, {
        backgroundColor: "#fafaf7",
        scale: 1,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
      if (!blob) throw new Error("Impossible de générer l'image");

      const fileName = `moi-president-${family.shortLabel.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;

      if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: "image/png" })] })) {
        const file = new File([blob], fileName, { type: "image/png" });
        await navigator.share({
          files: [file],
          text: `J'ai tranché en ${family.shortLabel} ${family.adjective}. Et toi ?`,
        });
        track("share_card_shared", { mode: "native", family: family.shortLabel });
      } else {
        const dataUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(dataUrl);
        track("share_card_shared", { mode: "download", family: family.shortLabel });
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      if (err && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      console.error("Share error:", err);
      setStatus("error");
      setErrorMsg("Impossible de générer l'image. Réessayez.");
    }
  };

  const label =
    status === "generating" ? "Création de l'image…" :
    status === "success" ? (isMobile ? "Partagé ✓" : "Téléchargé ✓") :
    isMobile ? "Partager ma carte" : "Télécharger ma carte";

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleClick}
        disabled={status === "generating"}
        style={{
          width: "100%",
          padding: "18px 22px",
          background: status === "success" ? "#3ACB72" : COLORS.white,
          border: "none",
          borderRadius: 18,
          color: COLORS.ink,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 500,
          cursor: status === "generating" ? "wait" : "pointer",
          opacity: status === "generating" ? 0.7 : 1,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          boxShadow: "0 4px 20px rgba(255,255,255,0.2)",
          letterSpacing: "-0.2px",
        }}
        onMouseEnter={(e) => {
          if (status !== "generating") {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(255,255,255,0.3)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,255,255,0.2)";
        }}
      >
        {label} {status === "idle" && "↗"}
      </button>
      {status === "error" && errorMsg && (
        <p style={{
          marginTop: 8,
          fontSize: 12,
          color: COLORS.lime,
          fontStyle: "italic",
          textAlign: "center"
        }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}

// Loader de script externe en promise
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      if (existing.dataset.loaded === "true") resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// ============================================================
// CAROUSEL DES SCÉNARIOS (swipe mobile + glisser desktop)
// ============================================================
function ScenariosCarousel({ scenarios, onSelectScenario }) {
  return (
    <Carousel cardWidthPct={88} cardMaxWidth={360}>
      {scenarios.map((s, i) => (
        <ScenarioButton
          key={i}
          code={s.code || `SCÉNARIO ${i + 1}`}
          color={resolveColor(s.color || "blue")}
          title={s.title || "Sans titre"}
          risk={s.risk || ""}
          desc={s.desc || ""}
          tags={(s.tags || []).filter(Boolean).map((t) => (Array.isArray(t) ? t : [t, true]))}
          onClick={() => onSelectScenario(i)}
        />
      ))}
    </Carousel>
  );
}

// ============================================================
// CAROUSEL GÉNÉRIQUE (mobile swipe + desktop flèches)
// ============================================================
function Carousel({ children, cardWidthPct = 88, cardMaxWidth = 360 }) {
  const scrollRef = useRef(null);
  const childArray = Array.isArray(children) ? children : [children].filter(Boolean);
  const total = childArray.length;
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    // Largeur d'une carte = première carte enfant
    const firstCard = el.querySelector("[data-card]");
    const cardWidth = firstCard ? firstCard.offsetWidth + 10 : 300; // +10 pour le gap
    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  // Suivre la position de scroll pour mettre à jour les pastilles
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-card]");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 10;
    const idx = Math.round(el.scrollLeft / cardWidth);
    if (idx !== activeIdx) setActiveIdx(idx);
  };

  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      {/* Flèche gauche (desktop) */}
      {total > 1 && (
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="republica-carousel-arrow republica-carousel-arrow-left"
          aria-label="Précédent"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="republica-carousel"
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingBottom: 8,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {childArray.map((child, i) => (
          <div
            key={i}
            data-card="true"
            style={{
              flex: `0 0 ${cardWidthPct}%`,
              maxWidth: cardMaxWidth,
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Flèche droite (desktop) */}
      {total > 1 && (
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="republica-carousel-arrow republica-carousel-arrow-right"
          aria-label="Suivant"
        >
          ›
        </button>
      )}

      {/* Pastilles cliquables */}
      {total > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 8,
        }}>
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const firstCard = el.querySelector("[data-card]");
                if (!firstCard) return;
                const cardWidth = firstCard.offsetWidth + 10;
                el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
              }}
              style={{
                width: i === activeIdx ? 28 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: i === activeIdx ? COLORS.navy : COLORS.border,
                cursor: "pointer",
                transition: "all 0.25s ease",
                padding: 0,
              }}
              aria-label={`Aller à la carte ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SocialShareButtons({ family }) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://republica-prototype.vercel.app";

  const familyInclusive = genderInclusive(family.shortLabel);
  const adjectiveInclusive = genderInclusive(family.adjective);
  const message = `J'ai géré ce sujet chaud en ${familyInclusive} ${adjectiveInclusive}. Et vous ?`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${siteUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(siteUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(message)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&summary=${encodeURIComponent(message)}`;

  const handleClick = (platform, url) => {
    track("share_card_shared", { mode: platform, family: family.shortLabel });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 11,
        color: COLORS.whiteSoft,
        fontWeight: 500,
        letterSpacing: "2px",
        textAlign: "center",
        margin: "0 0 12px",
      }}>OU PARTAGER DIRECTEMENT</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
      }}>
        <SocialButton icon="W" bg="#25D366" onClick={() => handleClick("whatsapp", whatsappUrl)} />
        <SocialButton icon="X" bg="#000000" onClick={() => handleClick("twitter", twitterUrl)} />
        <SocialButton icon="f" bg="#1877F2" onClick={() => handleClick("facebook", facebookUrl)} />
        <SocialButton icon="in" bg="#0A66C2" onClick={() => handleClick("linkedin", linkedinUrl)} />
      </div>
    </div>
  );
}

function SocialButton({ icon, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: bg,
        border: "none",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 18,
        fontWeight: 700,
        cursor: "pointer",
        borderRadius: 16,
        padding: "16px 8px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {icon}
    </button>
  );
}

// ============================================================
// COMPOSANT STATS COMMUNAUTAIRES
// Affiche le % de joueurs partageant la même famille politique
// ============================================================
function CommunityStats({ family }) {
  const [status, setStatus] = useState("loading");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const response = await fetch("/api/get-stats");
        if (!response.ok) throw new Error("Erreur " + response.status);
        const data = await response.json();
        if (cancelled) return;

        if (!data.ready) {
          setStats({ total: data.total });
          setStatus("not_enough");
        } else {
          const familyCount = (data.distribution || {})[family.shortLabel] || 0;
          const pct = data.total > 0 ? Math.round((familyCount / data.total) * 100) : 0;
          setStats({
            total: data.total,
            familyCount,
            pct,
            distribution: data.distribution,
          });
          setStatus("ready");
        }
      } catch (err) {
        console.error("Stats error:", err);
        if (!cancelled) setStatus("error");
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [family.shortLabel]);

  if (status === "loading") return null;
  if (status === "error") return null;

  if (status === "not_enough") {
    return (
      <div style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        borderRadius: 18,
        padding: "16px 18px",
        marginBottom: 22,
      }}>
        <p style={{
          fontSize: 10,
          color: COLORS.lime,
          fontWeight: 700,
          letterSpacing: "1.5px",
          margin: "0 0 6px",
        }}>◊ COMMUNAUTÉ</p>
        <p style={{
          fontSize: 14,
          color: COLORS.white,
          lineHeight: 1.5,
          margin: 0,
        }}>
          Pas encore assez de joueurs pour comparer. <span style={{ fontWeight: 500 }}>Partagez Moi Président(e)</span> pour faire grandir la communauté.
        </p>
      </div>
    );
  }

  const { pct, total } = stats;

  let rarity = "";
  if (pct >= 30) rarity = "C'est l'un des profils les plus fréquents.";
  else if (pct >= 15) rarity = "Un profil courant.";
  else if (pct >= 7) rarity = "Un profil minoritaire.";
  else rarity = "Vous faites partie d'une minorité rare.";

  return (
    <div style={{
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(8px)",
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 22,
    }}>
      <p style={{
        fontSize: 10,
        color: COLORS.lime,
        fontWeight: 700,
        letterSpacing: "1.5px",
        margin: "0 0 10px",
      }}>◊ DANS LA COMMUNAUTÉ</p>
      <p style={{
        fontSize: 17,
        color: COLORS.white,
        lineHeight: 1.4,
        margin: "0 0 8px",
        fontWeight: 500,
        letterSpacing: "-0.3px",
      }}>
        Vous êtes <span style={{ color: COLORS.lime }}>{family.shortLabel} {family.adjective}</span>, comme <span style={{
          color: COLORS.lime,
          fontWeight: 700,
          fontSize: 22,
        }}>{pct}%</span> des joueurs.
      </p>
      <p style={{
        fontSize: 12,
        color: COLORS.whiteSoft,
        lineHeight: 1.5,
        margin: 0,
        fontStyle: "italic",
      }}>
        {rarity} Sur {total} parties jouées.
      </p>
    </div>
  );
}
