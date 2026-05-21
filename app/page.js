"use client";

import { useState } from "react";

// ============================================================
// REPUBLICA · PROTOTYPE
// Tout l'état et toute la logique tiennent dans ce fichier.
// Aucun backend, aucun appel LLM. Conséquences scriptées en dur.
// ============================================================

const COLORS = {
  bg: "#0a0e14",
  bgDark: "#06090d",
  bgPanel: "#080b10",
  gold: "#d4af37",
  goldDim: "#a8862a",
  text: "#d4d4d0",
  textBright: "#f0ebe0",
  textMuted: "#9a9a93",
  textDim: "#6b6b66",
  red: "#c95a5a",
  redLight: "#d67a7a",
  green: "#7ac98a",
  blue: "#7aa5d6",
  yellow: "#e6c560",
};

const SECTIONS = {
  intro: "intro",
  dossier1: "dossier1",
  consequence1: "consequence1",
  dossier2: "dossier2",
  consequence2: "consequence2",
  profile: "profile",
};

export default function Page() {
  const [section, setSection] = useState(SECTIONS.intro);
  const [choices, setChoices] = useState({});
  const [indicators, setIndicators] = useState({
    debt: 115.6,
    confidence: 52,
    parliament: 287,
    tension: 4.2,
    spread: 64,
  });

  const recordChoice = (key, value, deltas) => {
    setChoices((c) => ({ ...c, [key]: value }));
    setIndicators((i) => ({
      debt: +(i.debt + (deltas.debt || 0)).toFixed(1),
      confidence: Math.max(0, Math.min(100, i.confidence + (deltas.confidence || 0))),
      parliament: i.parliament + (deltas.parliament || 0),
      tension: +(Math.max(0, Math.min(10, i.tension + (deltas.tension || 0)))).toFixed(1),
      spread: i.spread + (deltas.spread || 0),
    }));
  };

  return (
    <main style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "system-ui, -apple-system, sans-serif", padding: "0", margin: "0" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 12px 80px" }}>

        <Header section={section} setSection={setSection} />

        {section === SECTIONS.intro && <Intro onStart={() => setSection(SECTIONS.dossier1)} />}

        {section === SECTIONS.dossier1 && (
          <Dossier1
            indicators={indicators}
            onChoice={(choice, deltas) => {
              recordChoice("dossier1", choice, deltas);
              setSection(SECTIONS.consequence1);
            }}
          />
        )}

        {section === SECTIONS.consequence1 && (
          <Consequence1
            choice={choices.dossier1}
            indicators={indicators}
            onContinue={() => setSection(SECTIONS.dossier2)}
          />
        )}

        {section === SECTIONS.dossier2 && (
          <Dossier2
            indicators={indicators}
            onChoice={(choice, deltas) => {
              recordChoice("dossier2", choice, deltas);
              setSection(SECTIONS.consequence2);
            }}
          />
        )}

        {section === SECTIONS.consequence2 && (
          <Consequence2
            choice={choices.dossier2}
            indicators={indicators}
            onContinue={() => setSection(SECTIONS.profile)}
          />
        )}

        {section === SECTIONS.profile && (
          <Profile choices={choices} indicators={indicators} onRestart={() => {
            setChoices({});
            setIndicators({ debt: 115.6, confidence: 52, parliament: 287, tension: 4.2, spread: 64 });
            setSection(SECTIONS.intro);
          }} />
        )}

        <Footer />
      </div>
    </main>
  );
}

// ============================================================
// HEADER + FOOTER
// ============================================================

function Header({ section, setSection }) {
  const steps = ["intro", "dossier1", "consequence1", "dossier2", "consequence2", "profile"];
  const labels = ["Investiture", "Retraites", "Conséquences", "Cyberattaque", "Conséquences", "Profil"];
  const currentIdx = steps.indexOf(section);

  return (
    <div style={{ marginBottom: 18, borderBottom: `0.5px solid ${COLORS.gold}40`, paddingBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, background: COLORS.gold, borderRadius: "50%" }}></span>
          <span style={{ color: COLORS.gold, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>Republica · Prototype</span>
        </div>
        <span style={{ color: COLORS.textDim, fontFamily: "ui-monospace, monospace", fontSize: 9, letterSpacing: "0.1em" }}>
          ÉTAPE {currentIdx + 1} / {steps.length}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 2, background: i <= currentIdx ? COLORS.gold : `${COLORS.gold}20`, transition: "background 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop: 40, padding: "16px 4px", borderTop: `0.5px solid ${COLORS.text}15`, textAlign: "center" }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, letterSpacing: "0.1em" }}>
        REPUBLICA · SIMULATION PROSPECTIVE IA · RÉSULTATS NON PRÉDICTIFS
      </div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, marginTop: 4 }}>
        Prototype de démonstration — 2026
      </div>
    </div>
  );
}

// ============================================================
// SECTION 1 — INTRO
// ============================================================

function Intro({ onStart }) {
  return (
    <Section>
      <Tag>— Investiture présidentielle —</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 34, fontWeight: 500, color: COLORS.textBright, lineHeight: 1.1, margin: "0 0 16px" }}>
        Vous venez d'être élu Président de la République.
      </h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 16, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 24px" }}>
        Cent jours pour imprimer votre marque. Huit centres de pouvoir vous attendent : Bercy, les syndicats, Bruxelles, l'opinion, les médias, les marchés, le Conseil d'État, les collectivités. Chaque décision aura des conséquences. Aucune ne fera l'unanimité.
      </p>

      <div style={{ background: `${COLORS.gold}08`, border: `0.5px solid ${COLORS.gold}30`, borderRadius: 4, padding: 14, margin: "0 0 22px" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 8 }}>◊ ÉTAT DE LA NATION · DONNÉES VÉRIFIÉES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 1, background: `${COLORS.text}10` }}>
          <Stat label="Dette / PIB" value="115,6%" note="INSEE 2025" />
          <Stat label="Déficit" value="5,1%" note="du PIB" />
          <Stat label="Croissance" value="1,1%" note="annuelle" />
          <Stat label="Chômage" value="7,3%" note="BIT" />
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, fontStyle: "italic", margin: "0 0 26px" }}>
        Ceci est une simulation prospective IA. Les chiffres de départ sont vérifiés. Les conséquences sont des projections narratives, non des prévisions économétriques.
      </p>

      <BigButton onClick={onStart}>Prendre mes fonctions ↗</BigButton>
    </Section>
  );
}

// ============================================================
// SECTION 2 — PREMIER ARBITRAGE : RETRAITES
// ============================================================

function Dossier1({ indicators, onChoice }) {
  return (
    <Section>
      <Dashboard indicators={indicators} />

      <Tag>Note d'arbitrage présidentiel · J+12</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 26, fontWeight: 500, color: COLORS.textBright, lineHeight: 1.15, margin: "0 0 4px" }}>
        Réforme paramétrique des retraites
      </h1>
      <div style={{ fontSize: 12.5, color: COLORS.textMuted, fontStyle: "italic", marginBottom: 16 }}>
        Transmis par la Direction du Budget · visa SGG
      </div>

      <ExecutiveSummary>
        <p style={{ margin: "0 0 8px" }}>
          <strong style={{ color: COLORS.gold, fontWeight: 500 }}>Contexte.</strong> Le Conseil d'orientation des retraites projette un solde négatif du système de <span style={{ color: COLORS.textBright }}>6,6 Md€ en 2030</span><Sup>[1]</Sup>, dans un contexte de dette à 115,6% du PIB<Sup>[2]</Sup>.
        </p>
        <p style={{ margin: "0 0 8px" }}>
          <strong style={{ color: COLORS.gold, fontWeight: 500 }}>Enjeu.</strong> Trois voies sont soumises à votre arbitrage. Le choix conditionne 90% de la mobilisation sociale des prochains mois.
        </p>
        <Sources>
          <div><span style={{ color: COLORS.gold }}>[1]</span> COR · rapport annuel 2025</div>
          <div><span style={{ color: COLORS.gold }}>[2]</span> INSEE · comptes nationaux APU · 27.03.2026</div>
        </Sources>
      </ExecutiveSummary>

      <SubTag>Centres de pouvoir · positions exprimées</SubTag>
      <AgentsGrid>
        <Agent name="Bercy" color={COLORS.blue} stance="FAVORABLE" quote="L'effort doit être structurel. Un recul de l'âge légal est la trajectoire la plus efficace." />
        <Agent name="Intersyndicale" color={COLORS.red} stance="HOSTILE" quote="Préavis de grève reconductible déposé. Mobilisation prévue dès l'annonce." />
        <Agent name="Opinion publique" color={COLORS.textMuted} stance="DIVISÉE 62/38" quote="62% jugent la réforme injuste. 71% reconnaissent un problème de financement." />
        <Agent name="Bruxelles" color={COLORS.gold} stance="ATTENTIVE" quote="Procédure pour déficit excessif rappelée. Trajectoire 2027 sous surveillance." />
      </AgentsGrid>

      <SubTag>Arbitrage présidentiel · trois voies</SubTag>
      <ScenarioButton
        code="SCÉNARIO A"
        color={COLORS.blue}
        title="Trajectoire orthodoxe"
        risk="RISQUE ÉLEVÉ"
        desc="Recul de l'âge légal à 65 ans. Allongement de la durée de cotisation. Économie projetée : 14,8 Md€ d'ici 2030."
        tags={[
          { label: "+ Bercy", positive: true },
          { label: "+ Marchés", positive: true },
          { label: "− Syndicats", positive: false },
          { label: "− Opinion", positive: false },
        ]}
        onClick={() => onChoice("A", { debt: -0.3, confidence: -8, parliament: -5, tension: +2.2, spread: -5 })}
      />
      <ScenarioButton
        code="SCÉNARIO B"
        color={COLORS.gold}
        title="Voie de la négociation"
        risk="RISQUE MODÉRÉ"
        desc="Conférence sociale. Hausse progressive des cotisations + report partiel à 64 ans. Économie : 8,3 Md€."
        tags={[
          { label: "± Bercy", positive: null },
          { label: "± Syndicats", positive: null },
          { label: "− Patronat", positive: false },
          { label: "± Bruxelles", positive: null },
        ]}
        onClick={() => onChoice("B", { debt: -0.1, confidence: +2, parliament: -3, tension: +0.6, spread: +3 })}
      />
      <ScenarioButton
        code="SCÉNARIO C"
        color={COLORS.textMuted}
        title="Temporisation"
        risk="RISQUE DIFFÉRÉ"
        desc="Mission parlementaire de 6 mois. Aucune mesure immédiate. Trajectoire budgétaire inchangée."
        tags={[
          { label: "+ Opinion court terme", positive: true },
          { label: "− Bruxelles", positive: false },
          { label: "− Marchés", positive: false },
          { label: "− Crédibilité", positive: false },
        ]}
        onClick={() => onChoice("C", { debt: +0.2, confidence: +5, parliament: 0, tension: -0.8, spread: +12 })}
      />
    </Section>
  );
}

// ============================================================
// SECTION 3 — CONSÉQUENCES PREMIER ARBITRAGE
// ============================================================

function Consequence1({ choice, indicators, onContinue }) {
  const data = {
    A: {
      title: "Trajectoire orthodoxe retenue",
      narrative: "Cinq semaines après l'annonce, la mobilisation sociale est la plus forte depuis 1995. 1,4 million de manifestants. Trois ministres demandent une renégociation. Mais les marchés saluent la fermeté budgétaire.",
      events: [
        { day: "+7", label: "Préavis de grève reconductible national activé", color: COLORS.red },
        { day: "+18", label: "Manifestations massives : 1,4M de personnes dans la rue", color: COLORS.red },
        { day: "+25", label: "Conseil d'État valide la procédure", color: COLORS.green },
        { day: "+40", label: "Spread OAT/Bund se resserre de 5 pb", color: COLORS.green },
      ],
    },
    B: {
      title: "Voie de la négociation retenue",
      narrative: "Trois mois de conférence sociale. Accord arraché avec deux syndicats sur quatre. Le patronat dénonce la hausse des cotisations. Vous évitez le blocage mais ouvrez un front budgétaire.",
      events: [
        { day: "+5", label: "Ouverture de la conférence sociale interprofessionnelle", color: COLORS.gold },
        { day: "+22", label: "CFDT et UNSA signent. CGT et FO maintiennent la grève", color: COLORS.yellow },
        { day: "+35", label: "Le MEDEF qualifie l'accord d'« insoutenable »", color: COLORS.red },
        { day: "+50", label: "Spread OAT/Bund s'écarte de 3 pb", color: COLORS.yellow },
      ],
    },
    C: {
      title: "Temporisation retenue",
      narrative: "L'opinion vous remercie à court terme. Mais les marchés vous testent : le spread s'écarte de 12 points. Bruxelles ouvre une discussion bilatérale sur la trajectoire 2027. Vous gagnez du temps. Pas de la stabilité.",
      events: [
        { day: "+3", label: "Soulagement public. Cote de confiance en hausse", color: COLORS.green },
        { day: "+15", label: "Bruxelles convoque une réunion bilatérale", color: COLORS.yellow },
        { day: "+30", label: "Spread OAT/Bund s'écarte de 12 pb", color: COLORS.red },
        { day: "+45", label: "Première mise en garde de la Commission européenne", color: COLORS.red },
      ],
    },
  }[choice];

  return (
    <Section>
      <Dashboard indicators={indicators} highlight />

      <Tag>◊ Conséquences de votre arbitrage · J+62</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 24, fontWeight: 500, color: COLORS.textBright, lineHeight: 1.2, margin: "0 0 12px" }}>
        {data.title}
      </h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14.5, color: COLORS.text, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 20px" }}>
        {data.narrative}
      </p>

      <SubTag>Chronologie des 50 jours suivants</SubTag>
      <Timeline events={data.events} />

      <BigButton onClick={onContinue}>Suite du mandat ↗</BigButton>
    </Section>
  );
}

// ============================================================
// SECTION 4 — ÉVÉNEMENT IMPRÉVU : CYBERATTAQUE
// ============================================================

function Dossier2({ indicators, onChoice }) {
  return (
    <Section>
      <Dashboard indicators={indicators} />

      <div style={{ background: `${COLORS.red}15`, border: `0.5px solid ${COLORS.red}50`, borderRadius: 4, padding: 14, margin: "0 0 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, background: COLORS.red, borderRadius: "50%" }}></span>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.redLight, letterSpacing: "0.2em", fontWeight: 500 }}>DÉPÊCHE ENTRANTE · 06:51 · J+78</span>
        </div>
        <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14.5, color: COLORS.textBright, lineHeight: 1.55 }}>
          <strong style={{ color: COLORS.redLight, fontWeight: 500 }}>Cyberattaque coordonnée</strong> contre trois hôpitaux régionaux. L'ANSSI confirme une attaque par rançongiciel. <em>16 000 patients</em> sans accès à leur dossier médical. Un groupe revendique, demande 38 M€ en cryptomonnaie.
        </div>
      </div>

      <ExecutiveSummary>
        <p style={{ margin: "0 0 8px" }}>
          <strong style={{ color: COLORS.gold, fontWeight: 500 }}>Réalité documentée.</strong> Les cyberattaques contre les hôpitaux français ont augmenté de <span style={{ color: COLORS.textBright }}>31% en 2024</span><Sup>[1]</Sup>. L'ANSSI a recensé 11 incidents majeurs sur l'année.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: COLORS.gold, fontWeight: 500 }}>Enjeu présidentiel.</strong> Trois réponses sont possibles. La rapidité de votre décision est observée par les marchés autant que par l'opinion.
        </p>
        <Sources>
          <div><span style={{ color: COLORS.gold }}>[1]</span> ANSSI · panorama de la cybermenace 2024</div>
        </Sources>
      </ExecutiveSummary>

      <NouvelleEnergie>
        <p style={{ margin: "0 0 8px" }}>
          <strong style={{ color: COLORS.gold, fontWeight: 500 }}>Donnée vérifiée —</strong> Aucun État européen n'a jamais payé une rançon cyber publiquement. Mais 60% des entreprises privées victimes paient en secret<Sup>[2]</Sup>.
        </p>
        <div style={{ marginTop: 12, padding: "10px 12px", background: `${COLORS.gold}10`, borderLeft: `2px solid ${COLORS.gold}`, fontFamily: "ui-serif, Georgia, serif", fontSize: 13.5, color: COLORS.textBright, lineHeight: 1.6 }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 4 }}>◊ PROPOSITION ALTERNATIVE</div>
          <strong style={{ fontWeight: 500 }}>Riposte coordonnée européenne.</strong> Plutôt qu'une réponse française isolée, activer immédiatement l'article 222 du TFUE (clause de solidarité) et proposer une cellule cyber permanente UE. Effet : ne plus jamais répondre seul à ces attaques.
        </div>
        <Sources><div><span style={{ color: COLORS.gold }}>[2]</span> Étude Cybersecurity Ventures 2024</div></Sources>
      </NouvelleEnergie>

      <SubTag>Votre décision · sous une heure</SubTag>
      <ScenarioButton
        code="OPTION 1"
        color={COLORS.red}
        title="Cellule de crise immédiate"
        risk="FERMETÉ"
        desc="Refus de toute négociation. Activation du plan ORSEC sanitaire. Allocution solennelle à 13h sur le refus du chantage cyber."
        tags={[
          { label: "+ Opinion (autorité)", positive: true },
          { label: "+ Régaliens", positive: true },
          { label: "− Hôpitaux affectés", positive: false },
        ]}
        onClick={() => onChoice("crisis", { debt: 0, confidence: +4, parliament: +2, tension: -0.5, spread: -2 })}
      />
      <ScenarioButton
        code="OPTION 2"
        color={COLORS.gold}
        title="Riposte européenne (Nouvelle Énergie)"
        risk="COORDONNÉE"
        desc="Activation article 222 TFUE. Proposition d'une cellule cyber permanente UE. Conférence de presse conjointe avec deux chefs d'État."
        tags={[
          { label: "+ Bruxelles", positive: true },
          { label: "+ Récit présidentiel", positive: true },
          { label: "± Marchés", positive: null },
        ]}
        onClick={() => onChoice("european", { debt: 0, confidence: +6, parliament: +3, tension: -0.8, spread: -4 })}
      />
      <ScenarioButton
        code="OPTION 3"
        color={COLORS.textMuted}
        title="Reporter, gérer en interne"
        risk="DISCRET"
        desc="Pas de communication présidentielle. L'ANSSI gère seule, sans visibilité publique. Reprendre l'agenda initial dès que possible."
        tags={[
          { label: "+ Marchés (calme)", positive: true },
          { label: "− Opinion (passivité)", positive: false },
          { label: "− Médias", positive: false },
        ]}
        onClick={() => onChoice("postpone", { debt: 0, confidence: -3, parliament: -1, tension: +0.3, spread: -1 })}
      />
    </Section>
  );
}

// ============================================================
// SECTION 5 — CONSÉQUENCES CYBERATTAQUE
// ============================================================

function Consequence2({ choice, indicators, onContinue }) {
  const data = {
    crisis: {
      title: "Cellule de crise activée",
      narrative: "L'allocution solennelle marque les esprits. 71% des Français soutiennent la fermeté présidentielle. L'ANSSI reprend la main en 72h. Aucune rançon versée, deux des trois hôpitaux fonctionnent à 80% en une semaine.",
    },
    european: {
      title: "Riposte européenne déclenchée",
      narrative: "L'activation de l'article 222 fait événement. Pour la première fois, l'UE répond en formation collective à une cyberattaque contre un État membre. La presse internationale couvre largement. Le récit présidentiel franchit un seuil de crédibilité.",
    },
    postpone: {
      title: "Gestion en interne",
      narrative: "Trois jours de silence présidentiel. Les médias s'agitent. Une fuite révèle que vous avez refusé de communiquer publiquement. L'opposition parle de « démission présidentielle face à la menace cyber ». L'ANSSI résout techniquement, mais le récit est perdu.",
    },
  }[choice];

  return (
    <Section>
      <Dashboard indicators={indicators} highlight />
      <Tag>◊ Bilan de la crise · J+100</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 24, fontWeight: 500, color: COLORS.textBright, lineHeight: 1.2, margin: "0 0 12px" }}>
        {data.title}
      </h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14.5, color: COLORS.text, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 26px" }}>
        {data.narrative}
      </p>
      <BigButton onClick={onContinue}>Découvrir mon profil politique ↗</BigButton>
    </Section>
  );
}

// ============================================================
// SECTION 6 — PROFIL POLITIQUE FINAL
// ============================================================

function Profile({ choices, indicators, onRestart }) {
  // Logique de classification simplifiée
  const family = classifyFamily(choices);

  return (
    <Section>
      <Tag>— Votre famille politique —</Tag>

      <div style={{ textAlign: "center", padding: "18px 24px", border: `1px solid ${COLORS.gold}50`, borderRadius: 4, background: `${COLORS.gold}05`, margin: "0 0 22px", position: "relative" }}>
        <div style={{ position: "absolute", top: 6, right: 8, fontFamily: "ui-monospace, monospace", fontSize: 8, color: COLORS.textDim, letterSpacing: "0.15em" }}>N° 048</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.25em", marginBottom: 6 }}>CLASSIFICATION</div>
        <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 28, fontWeight: 500, color: COLORS.textBright, lineHeight: 1.15 }}>
          {family.label}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textMuted, letterSpacing: "0.15em", marginTop: 10 }}>
          PROCHE DE : {family.closeTo}
        </div>
      </div>

      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14, color: COLORS.text, lineHeight: 1.65, fontStyle: "italic", textAlign: "center", margin: "0 0 26px" }}>
        « {family.tagline} »
      </p>

      <SubTag>État final de votre mandat · J+100</SubTag>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 1, background: `${COLORS.text}10`, marginBottom: 20 }}>
        <Stat label="Dette / PIB" value={`${indicators.debt}%`} note={delta(indicators.debt - 115.6)} />
        <Stat label="Confiance" value={`${indicators.confidence}%`} note={delta(indicators.confidence - 52)} />
        <Stat label="Soutien AN" value={`${indicators.parliament}`} note={delta(indicators.parliament - 287)} />
        <Stat label="Tension" value={`${indicators.tension}/10`} note={delta(indicators.tension - 4.2)} />
      </div>

      {/* CARTE DE PARTAGE */}
      <SubTag>Carte de partage · #MES100JOURS</SubTag>
      <div style={{ background: `linear-gradient(180deg, ${COLORS.bg} 0%, #1a1410 100%)`, border: `1px solid ${COLORS.gold}40`, borderRadius: 8, padding: "22px 18px", position: "relative", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontFamily: "ui-serif, Georgia, serif", fontSize: 140, color: `${COLORS.gold}08`, fontWeight: 500, lineHeight: 1 }}>R</div>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.gold, letterSpacing: "0.25em", marginBottom: 12 }}>REPUBLICA · MES 100 JOURS</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 19, fontWeight: 500, color: COLORS.textBright, lineHeight: 1.2 }}>J'ai gouverné en</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 24, fontWeight: 500, color: COLORS.gold, lineHeight: 1.1, fontStyle: "italic", marginBottom: 14 }}>
            {family.shortLabel}
          </div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13, color: COLORS.text, lineHeight: 1.55, fontStyle: "italic", padding: "10px 0", borderTop: `0.5px solid ${COLORS.gold}30`, borderBottom: `0.5px solid ${COLORS.gold}30`, marginBottom: 12 }}>
            « {family.shareQuote} »
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <ShareStat label="CONFIANCE" value={`${indicators.confidence}%`} />
            <ShareStat label="DETTE" value={`${indicators.debt}%`} />
            <ShareStat label="FAMILLE" value={`${family.pct}%`} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: `0.5px solid ${COLORS.text}10`, fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, letterSpacing: "0.15em" }}>
            <span>REPUBLICA.FR · ET TOI ?</span>
            <span style={{ color: COLORS.gold }}>#MES100JOURS</span>
          </div>
        </div>
      </div>

      <BigButton onClick={onRestart}>Rejouer un autre mandat ↗</BigButton>

      <div style={{ marginTop: 22, padding: 14, background: `${COLORS.gold}06`, border: `0.5px solid ${COLORS.gold}25`, borderRadius: 4 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.gold, letterSpacing: "0.2em", marginBottom: 8 }}>◊ PROTOTYPE — VERSION DE DÉMONSTRATION</div>
        <p style={{ fontSize: 12.5, color: COLORS.text, lineHeight: 1.6, margin: 0 }}>
          Ceci est un prototype non commercial. La version finale proposera 60 dossiers de réforme, un mandat complet de 100 jours, des conséquences générées par IA en temps réel, et un comparatif anonymisé entre tous les joueurs.
        </p>
      </div>
    </Section>
  );
}

// Classification politique simplifiée (4 familles possibles dans ce prototype)
function classifyFamily(choices) {
  const c1 = choices.dossier1;
  const c2 = choices.dossier2;

  if (c1 === "A" && c2 === "crisis") return {
    label: "Droite conservatrice",
    shortLabel: "Droite conservatrice",
    closeTo: "Tradition gaulliste réformatrice",
    tagline: "Vous gouvernez par la fermeté. Votre boussole : l'autorité, la responsabilité budgétaire, le refus du compromis perçu comme faiblesse.",
    shareQuote: "J'ai imposé la réforme et tenu face à la cyberattaque. Le pays plie. Il ne se rompt pas.",
    pct: 22,
  };
  if (c1 === "A" && c2 === "european") return {
    label: "Centre-droit · libéral européen",
    shortLabel: "Centre-droit libéral",
    closeTo: "Macronisme première manière",
    tagline: "Vous croyez à la rigueur et à l'Europe comme leviers conjoints. Vous tranchez sur le fond, vous coopérez sur les moyens.",
    shareQuote: "Réforme structurelle d'un côté, riposte européenne de l'autre. J'ai assumé les deux.",
    pct: 19,
  };
  if (c1 === "B" && c2 === "european") return {
    label: "Centre · social-européen",
    shortLabel: "Centre social-européen",
    closeTo: "Sociale-démocratie réformiste",
    tagline: "Vous croyez à la négociation comme méthode et à l'Europe comme cadre. La stabilité avant la rupture, le collectif avant le geste.",
    shareQuote: "J'ai négocié, j'ai européanisé. Le pays avance sans se déchirer.",
    pct: 16,
  };
  if (c1 === "B" && c2 === "crisis") return {
    label: "Centre technocratique",
    shortLabel: "Centre technocratique",
    closeTo: "Tradition rocardienne",
    tagline: "Vous croyez à la méthode plus qu'à la rupture. Vous tranchez, mais sans bruit. Vous gouvernez plus que vous ne politisez.",
    shareQuote: "Réforme négociée, crise gérée. Pas de feuilleton, juste des résultats.",
    pct: 14,
  };
  if (c1 === "C" && c2 === "european") return {
    label: "Centre-gauche · réformiste prudent",
    shortLabel: "Centre-gauche prudent",
    closeTo: "Hollandisme tardif",
    tagline: "Vous croyez au temps long, à la délibération démocratique, à la coopération internationale. Vous évitez la friction sociale au prix de la lisibilité.",
    shareQuote: "J'ai pris le temps. Et j'ai construit l'Europe pendant que d'autres se battaient.",
    pct: 12,
  };
  if (c1 === "C" && c2 === "crisis") return {
    label: "Souverainisme social",
    shortLabel: "Souverainisme social",
    closeTo: "Tradition gaullo-protectionniste",
    tagline: "Vous protégez le modèle social et la fermeté régalienne. Vous refusez l'orthodoxie budgétaire et l'effacement européen.",
    shareQuote: "Pas de réforme imposée, pas de chantage cyber. La France d'abord.",
    pct: 11,
  };
  // Cas par défaut C + postpone
  return {
    label: "Gauche radicale",
    shortLabel: "Gauche radicale",
    closeTo: "Tradition contestataire",
    tagline: "Vous refusez les cadres imposés : pas de réforme contre les salariés, pas de communication présidentielle face à une crise importée.",
    shareQuote: "J'ai refusé les cadres. J'ai gouverné à contre-courant.",
    pct: 9,
  };
}

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

function Section({ children }) {
  return <div style={{ padding: "8px 0" }}>{children}</div>;
}

function Tag({ children }) {
  return <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}

function SubTag({ children }) {
  return <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: "0.2em", textTransform: "uppercase", margin: "20px 0 12px" }}>{children}</div>;
}

function Sup({ children }) {
  return <sup style={{ color: COLORS.gold, fontSize: 9, verticalAlign: "super" }}>{children}</sup>;
}

function Sources({ children }) {
  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `0.5px solid ${COLORS.text}10`, fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, lineHeight: 1.7 }}>
      {children}
    </div>
  );
}

function ExecutiveSummary({ children }) {
  return (
    <div style={{ padding: 14, background: `${COLORS.text}05`, borderLeft: `2px solid ${COLORS.gold}`, marginBottom: 18 }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 8 }}>— EXECUTIVE SUMMARY —</div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13.5, color: COLORS.text, lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

function NouvelleEnergie({ children }) {
  return (
    <div style={{ padding: 14, background: `${COLORS.text}05`, border: `0.5px solid ${COLORS.gold}30`, borderRadius: 6, marginBottom: 18, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.bg, fontWeight: 600 }}>NE</div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.textBright }}>Nouvelle Énergie</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, fontStyle: "italic" }}>Contre-expertise indépendante</div>
        </div>
      </div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

function Dashboard({ indicators, highlight }) {
  return (
    <div style={{ background: COLORS.bgPanel, padding: "12px 14px", borderRadius: 4, marginBottom: 18, border: highlight ? `0.5px solid ${COLORS.gold}30` : "none" }}>
      <Tag>État de la nation</Tag>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 1, background: `${COLORS.text}10`, marginTop: 4 }}>
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
    <div style={{ background: COLORS.bg, padding: "10px 10px" }}>
      <div style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 16, color: COLORS.textBright, marginTop: 3 }}>{value}</div>
      {note && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{note}</div>}
    </div>
  );
}

function ShareStat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, color: COLORS.textBright, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function AgentsGrid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginBottom: 14 }}>{children}</div>;
}

function Agent({ name, color, stance, quote }) {
  return (
    <div style={{ padding: "10px 12px", background: `${COLORS.text}03`, borderLeft: `2px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: COLORS.textBright }}>{name}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color, letterSpacing: "0.05em" }}>{stance}</span>
      </div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 12, fontStyle: "italic", color: COLORS.textMuted, lineHeight: 1.5 }}>« {quote} »</div>
    </div>
  );
}

function ScenarioButton({ code, color, title, risk, desc, tags, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        background: `${color}08`,
        border: `0.5px solid ${color}40`,
        borderRadius: 4,
        color: COLORS.text,
        cursor: "pointer",
        marginBottom: 8,
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}15`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${color}08`)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color, letterSpacing: "0.1em" }}>{code}</span>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: COLORS.textBright }}>{title}</span>
        </div>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim }}>{risk}</span>
      </div>
      <div style={{ fontSize: 12.5, color: COLORS.textMuted, lineHeight: 1.5, marginBottom: 7 }}>{desc}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, fontFamily: "ui-monospace, monospace", fontSize: 9.5 }}>
        {tags.map((t, i) => (
          <span key={i} style={{ padding: "2px 7px", background: t.positive === true ? `${COLORS.green}15` : t.positive === false ? `${COLORS.red}15` : `${COLORS.yellow}15`, color: t.positive === true ? COLORS.green : t.positive === false ? COLORS.redLight : COLORS.yellow, borderRadius: 2 }}>
            {t.label}
          </span>
        ))}
      </div>
    </button>
  );
}

function Timeline({ events }) {
  return (
    <div style={{ paddingLeft: 18, borderLeft: `0.5px solid ${COLORS.gold}30`, margin: "0 0 22px" }}>
      {events.map((e, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: 14 }}>
          <span style={{ position: "absolute", left: -23, top: 3, width: 9, height: 9, background: e.color, borderRadius: "50%", border: `2px solid ${COLORS.bg}` }}></span>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: e.color, letterSpacing: "0.15em", marginBottom: 3 }}>JOUR {e.day}</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13, color: COLORS.textBright, lineHeight: 1.5 }}>{e.label}</div>
        </div>
      ))}
    </div>
  );
}

function BigButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 20px",
        background: `${COLORS.gold}10`,
        border: `0.5px solid ${COLORS.gold}50`,
        color: COLORS.gold,
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        letterSpacing: "0.2em",
        cursor: "pointer",
        borderRadius: 3,
        textTransform: "uppercase",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${COLORS.gold}20`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${COLORS.gold}10`)}
    >
      {children}
    </button>
  );
}

function delta(d) {
  if (Math.abs(d) < 0.05) return "— stable";
  const sign = d > 0 ? "▲" : "▼";
  return `${sign} ${d > 0 ? "+" : ""}${d.toFixed(1)}`;
}
