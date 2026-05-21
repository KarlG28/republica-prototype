"use client";

import { useState, useMemo } from "react";

// ============================================================
// REPUBLICA · PROTOTYPE — VERSION NOUVELLE ÉNERGIE
//
// COMMENT MODIFIER CE FICHIER :
// - Pour changer une couleur : voir la section COULEURS ci-dessous
// - Pour ajouter un dossier : ajouter une entrée dans CATALOGUE_DOSSIERS
// - Pour modifier les textes d'intro/fin : voir les sections Intro et Profile
// ============================================================

// ============================================================
// COULEURS — Charte Nouvelle Énergie
// Bleu nuit dominant, blanc cassé, or vieilli en accent
// ============================================================
const COLORS = {
  bg: "#fafaf7",           // Fond général : blanc cassé doux
  bgPanel: "#ffffff",       // Panneaux : blanc pur
  bgDark: "#0a1a3a",        // Bleu nuit Nouvelle Énergie
  bgDarker: "#061226",      // Bleu nuit plus profond pour les bandeaux
  navy: "#0a1a3a",          // Bleu nuit principal
  navyLight: "#1e3a7a",     // Bleu nuit éclairci
  gold: "#b8954a",          // Or vieilli Nouvelle Énergie
  goldDim: "#8a7037",       // Or plus sombre
  text: "#1a1a1a",          // Texte principal sur fond clair
  textBright: "#0a1a3a",    // Texte mis en valeur (bleu nuit)
  textMuted: "#5a5a5a",     // Texte secondaire
  textDim: "#8a8a8a",       // Texte tertiaire
  textOnDark: "#fafaf7",    // Texte sur fond sombre
  border: "#e0dcd3",        // Bordures discrètes
  red: "#a83232",
  redLight: "#c95a5a",
  green: "#3a7a4a",
  blue: "#2a5a8a",
  yellow: "#a87a2a",
};

const SECTIONS = {
  intro: "intro",
  dossier1: "dossier1",
  consequence1: "consequence1",
  dossier2: "dossier2",
  consequence2: "consequence2",
  profile: "profile",
};

// ============================================================
// CATALOGUE DE DOSSIERS
// Six dossiers possibles. À chaque session, 2 sont tirés au hasard.
// Pour ajouter un dossier, copie-colle un bloc complet ci-dessous.
// ============================================================

const CATALOGUE_DOSSIERS = [
  // ----------- DOSSIER 1 : RETRAITES -----------
  {
    id: "retraites",
    day: "J+12",
    tag: "Note d'arbitrage présidentiel",
    title: "Réforme paramétrique des retraites",
    subtitle: "Transmis par la Direction du Budget · visa SGG",
    summary: {
      contexte: "Le Conseil d'orientation des retraites projette un solde négatif du système de **6,6 Md€ en 2030**[1], dans un contexte de dette à 115,6% du PIB[2].",
      enjeu: "Trois voies sont soumises à votre arbitrage. Le choix conditionne 90% de la mobilisation sociale des prochains mois.",
    },
    sources: [
      "[1] COR · rapport annuel 2025",
      "[2] INSEE · comptes nationaux APU · 27.03.2026",
    ],
    agents: [
      { name: "Bercy", color: "blue", stance: "FAVORABLE", quote: "L'effort doit être structurel. Un recul de l'âge légal est la trajectoire la plus efficace." },
      { name: "Intersyndicale", color: "red", stance: "HOSTILE", quote: "Préavis de grève reconductible déposé. Mobilisation prévue dès l'annonce." },
      { name: "Opinion publique", color: "muted", stance: "DIVISÉE 62/38", quote: "62% jugent la réforme injuste. 71% reconnaissent un problème de financement." },
      { name: "Bruxelles", color: "gold", stance: "ATTENTIVE", quote: "Procédure pour déficit excessif rappelée. Trajectoire 2027 sous surveillance." },
    ],
    scenarios: [
      {
        code: "SCÉNARIO A", color: "blue", title: "Trajectoire orthodoxe", risk: "RISQUE ÉLEVÉ",
        desc: "Recul de l'âge légal à 65 ans. Allongement de la durée de cotisation. Économie projetée : 14,8 Md€ d'ici 2030.",
        tags: [["+ Bercy", true], ["+ Marchés", true], ["− Syndicats", false], ["− Opinion", false]],
        deltas: { debt: -0.3, confidence: -8, parliament: -5, tension: +2.2, spread: -5 },
        signature: "A",
      },
      {
        code: "SCÉNARIO B", color: "gold", title: "Voie de la négociation", risk: "RISQUE MODÉRÉ",
        desc: "Conférence sociale. Hausse progressive des cotisations + report partiel à 64 ans. Économie : 8,3 Md€.",
        tags: [["± Bercy", null], ["± Syndicats", null], ["− Patronat", false], ["± Bruxelles", null]],
        deltas: { debt: -0.1, confidence: +2, parliament: -3, tension: +0.6, spread: +3 },
        signature: "B",
      },
      {
        code: "SCÉNARIO C", color: "muted", title: "Temporisation", risk: "RISQUE DIFFÉRÉ",
        desc: "Mission parlementaire de 6 mois. Aucune mesure immédiate. Trajectoire budgétaire inchangée.",
        tags: [["+ Opinion court terme", true], ["− Bruxelles", false], ["− Marchés", false], ["− Crédibilité", false]],
        deltas: { debt: +0.2, confidence: +5, parliament: 0, tension: -0.8, spread: +12 },
        signature: "C",
      },
    ],
    consequences: {
      A: {
        title: "Trajectoire orthodoxe retenue",
        narrative: "Cinq semaines après l'annonce, la mobilisation sociale est la plus forte depuis 1995. 1,4 million de manifestants. Trois ministres demandent une renégociation. Mais les marchés saluent la fermeté budgétaire.",
        events: [
          { day: "+7", label: "Préavis de grève reconductible national activé", color: "red" },
          { day: "+18", label: "Manifestations massives : 1,4M de personnes dans la rue", color: "red" },
          { day: "+25", label: "Conseil d'État valide la procédure", color: "green" },
          { day: "+40", label: "Spread OAT/Bund se resserre de 5 pb", color: "green" },
        ],
      },
      B: {
        title: "Voie de la négociation retenue",
        narrative: "Trois mois de conférence sociale. Accord arraché avec deux syndicats sur quatre. Le patronat dénonce la hausse des cotisations. Vous évitez le blocage mais ouvrez un front budgétaire.",
        events: [
          { day: "+5", label: "Ouverture de la conférence sociale interprofessionnelle", color: "gold" },
          { day: "+22", label: "CFDT et UNSA signent. CGT et FO maintiennent la grève", color: "yellow" },
          { day: "+35", label: "Le MEDEF qualifie l'accord d'« insoutenable »", color: "red" },
          { day: "+50", label: "Spread OAT/Bund s'écarte de 3 pb", color: "yellow" },
        ],
      },
      C: {
        title: "Temporisation retenue",
        narrative: "L'opinion vous remercie à court terme. Mais les marchés vous testent : le spread s'écarte de 12 points. Bruxelles ouvre une discussion bilatérale sur la trajectoire 2027.",
        events: [
          { day: "+3", label: "Soulagement public. Cote de confiance en hausse", color: "green" },
          { day: "+15", label: "Bruxelles convoque une réunion bilatérale", color: "yellow" },
          { day: "+30", label: "Spread OAT/Bund s'écarte de 12 pb", color: "red" },
          { day: "+45", label: "Première mise en garde de la Commission européenne", color: "red" },
        ],
      },
    },
  },

  // ----------- DOSSIER 2 : CYBERATTAQUE -----------
  {
    id: "cyber",
    day: "J+78",
    tag: "Dépêche entrante · cellule de crise",
    title: "Cyberattaque coordonnée contre trois hôpitaux",
    subtitle: "L'ANSSI confirme une attaque par rançongiciel · 16 000 patients sans dossier médical",
    urgent: true,
    summary: {
      contexte: "Les cyberattaques contre les hôpitaux français ont augmenté de **31% en 2024**[1]. Un groupe revendique l'attaque actuelle et demande 38 M€ en cryptomonnaie.",
      enjeu: "Trois réponses sont possibles. La rapidité de votre décision est observée par les marchés autant que par l'opinion.",
    },
    sources: [
      "[1] ANSSI · panorama de la cybermenace 2024",
    ],
    nouvelleEnergie: {
      verified: "Aucun État européen n'a jamais payé une rançon cyber publiquement. Mais 60% des entreprises privées victimes paient en secret.",
      proposal: "**Riposte coordonnée européenne.** Plutôt qu'une réponse française isolée, activer immédiatement l'article 222 du TFUE (clause de solidarité) et proposer une cellule cyber permanente UE.",
    },
    agents: [
      { name: "ANSSI", color: "blue", stance: "ENGAGÉE", quote: "Confinement en cours. Trois jours minimum pour rétablir les systèmes." },
      { name: "Hôpitaux", color: "red", stance: "EN DÉTRESSE", quote: "Reports de chirurgie. Risque vital pour les patients sous monitoring." },
      { name: "Opinion publique", color: "muted", stance: "VIGILANTE", quote: "78% attendent une prise de parole présidentielle dans la journée." },
      { name: "Bruxelles", color: "gold", stance: "SOLIDAIRE", quote: "Disponible pour activation de l'article 222 si demande française." },
    ],
    scenarios: [
      {
        code: "OPTION 1", color: "red", title: "Cellule de crise immédiate", risk: "FERMETÉ",
        desc: "Refus de toute négociation. Activation du plan ORSEC sanitaire. Allocution solennelle à 13h sur le refus du chantage cyber.",
        tags: [["+ Opinion (autorité)", true], ["+ Régaliens", true], ["− Hôpitaux affectés", false]],
        deltas: { debt: 0, confidence: +4, parliament: +2, tension: -0.5, spread: -2 },
        signature: "crisis",
      },
      {
        code: "OPTION 2", color: "gold", title: "Riposte européenne (Nouvelle Énergie)", risk: "COORDONNÉE",
        desc: "Activation article 222 TFUE. Proposition d'une cellule cyber permanente UE. Conférence de presse conjointe avec deux chefs d'État.",
        tags: [["+ Bruxelles", true], ["+ Récit présidentiel", true], ["± Marchés", null]],
        deltas: { debt: 0, confidence: +6, parliament: +3, tension: -0.8, spread: -4 },
        signature: "european",
      },
      {
        code: "OPTION 3", color: "muted", title: "Reporter, gérer en interne", risk: "DISCRET",
        desc: "Pas de communication présidentielle. L'ANSSI gère seule, sans visibilité publique. Reprendre l'agenda initial dès que possible.",
        tags: [["+ Marchés (calme)", true], ["− Opinion (passivité)", false], ["− Médias", false]],
        deltas: { debt: 0, confidence: -3, parliament: -1, tension: +0.3, spread: -1 },
        signature: "postpone",
      },
    ],
    consequences: {
      crisis: {
        title: "Cellule de crise activée",
        narrative: "L'allocution solennelle marque les esprits. 71% des Français soutiennent la fermeté présidentielle. L'ANSSI reprend la main en 72h. Aucune rançon versée, deux des trois hôpitaux fonctionnent à 80% en une semaine.",
        events: [
          { day: "+1", label: "Allocution présidentielle · 12,4 millions de téléspectateurs", color: "gold" },
          { day: "+3", label: "ANSSI confine les systèmes attaqués", color: "blue" },
          { day: "+7", label: "Deux hôpitaux sur trois opérationnels à 80%", color: "green" },
          { day: "+15", label: "Sondage : 71% approuvent la fermeté présidentielle", color: "green" },
        ],
      },
      european: {
        title: "Riposte européenne déclenchée",
        narrative: "L'activation de l'article 222 fait événement. Pour la première fois, l'UE répond en formation collective à une cyberattaque contre un État membre. La presse internationale couvre largement.",
        events: [
          { day: "+1", label: "Conférence conjointe avec l'Allemagne et l'Italie", color: "gold" },
          { day: "+4", label: "Bruxelles annonce la cellule cyber permanente UE", color: "green" },
          { day: "+10", label: "Politico salue « un tournant européen du cyber »", color: "green" },
          { day: "+25", label: "Création d'un poste de Commissaire européen cyber", color: "blue" },
        ],
      },
      postpone: {
        title: "Gestion en interne",
        narrative: "Trois jours de silence présidentiel. Les médias s'agitent. Une fuite révèle que vous avez refusé de communiquer publiquement. L'opposition parle de « démission présidentielle face à la menace cyber ».",
        events: [
          { day: "+2", label: "Le Monde : « Silence présidentiel troublant »", color: "red" },
          { day: "+5", label: "Opposition demande une commission d'enquête", color: "red" },
          { day: "+10", label: "ANSSI résout techniquement la crise", color: "green" },
          { day: "+18", label: "Cote de confiance présidentielle : −3 pts", color: "red" },
        ],
      },
    },
  },

  // ----------- DOSSIER 3 : AUTOROUTES -----------
  {
    id: "autoroutes",
    day: "J+47",
    tag: "Note d'arbitrage présidentiel",
    title: "Reprise des concessions autoroutières",
    subtitle: "Échéance 2031-2036 · sept sociétés concernées",
    summary: {
      contexte: "Sept concessions autoroutières arrivent à échéance d'ici 2036. Actif estimé entre **40 et 55 Md€** sur la décennie. 78% des Français favorables à une renationalisation[1].",
      enjeu: "Trois options structurent l'arbitrage. Le choix engage l'État pour 30 ans.",
    },
    sources: [
      "[1] Baromètre Elabe · octobre 2024",
    ],
    nouvelleEnergie: {
      verified: "L'État a déjà perçu environ 32 Md€ de dividendes des concessions depuis 2006. Les sociétés affichent une rentabilité supérieure aux prévisions du contrat initial.",
      proposal: "**Reprise différée avec fonds souverain.** Attendre l'échéance naturelle 2031. Créer un fonds souverain autoroutier alimenté progressivement par les recettes 2026-2031. Coût net : nul.",
    },
    agents: [
      { name: "Bercy", color: "blue", stance: "PRUDENTE", quote: "Toute option a un coût juridique. La séquence doit être maîtrisée sur dix ans." },
      { name: "Concessionnaires", color: "red", stance: "MOBILISÉS", quote: "Recours immédiat envisagé. La rupture unilatérale est inacceptable." },
      { name: "Opinion publique", color: "green", stance: "FAVORABLE 78/22", quote: "Forte attente sociale. Les péages sont vécus comme une injustice." },
      { name: "Bruxelles", color: "gold", stance: "VIGILANTE", quote: "Toute nouvelle attribution doit respecter le droit de la concurrence." },
    ],
    scenarios: [
      {
        code: "SCÉNARIO A", color: "blue", title: "Prolongation négociée", risk: "RECETTES IMMÉDIATES",
        desc: "Prolongation jusqu'à 2041 en échange d'une redevance majorée et d'une baisse de 8% des péages.",
        tags: [["+ Bercy", true], ["+ Marchés", true], ["− Opinion", false]],
        deltas: { debt: -0.3, confidence: -4, parliament: +1, tension: +0.3, spread: -3 },
        signature: "A",
      },
      {
        code: "SCÉNARIO B", color: "gold", title: "Reprise en régie publique", risk: "POPULAIRE / COÛTEUX",
        desc: "Création d'une foncière autoroutière d'État. Investissement initial 12 Md€. Retour sur 15 ans.",
        tags: [["+ Opinion", true], ["− Bercy", false], ["− Marchés", false]],
        deltas: { debt: +1.2, confidence: +6, parliament: +2, tension: -0.4, spread: +8 },
        signature: "B",
      },
      {
        code: "SCÉNARIO C", color: "muted", title: "Concurrence ouverte", risk: "INCERTITUDE JURIDIQUE",
        desc: "Appel d'offres ouvert à de nouveaux entrants, dont consortiums publics européens.",
        tags: [["+ Opinion 67%", true], ["+ Bruxelles", true], ["− Concessionnaires", false]],
        deltas: { debt: +0.5, confidence: +4, parliament: -2, tension: +0.5, spread: +5 },
        signature: "C",
      },
    ],
    consequences: {
      A: {
        title: "Prolongation négociée actée",
        narrative: "Les recettes immédiates rassurent les marchés. Mais 64% des Français jugent que vous avez « cédé aux concessionnaires ». L'opposition s'en saisit pour incarner la défense du pouvoir d'achat.",
        events: [
          { day: "+10", label: "Signature de l'accord avec les sept concessionnaires", color: "blue" },
          { day: "+20", label: "Baisse de 8% des péages effective", color: "green" },
          { day: "+45", label: "Sondage : 64% jugent l'accord favorable aux concessionnaires", color: "red" },
          { day: "+60", label: "Opposition lance le slogan « Pouvoir d'achat trahi »", color: "red" },
        ],
      },
      B: {
        title: "Reprise en régie engagée",
        narrative: "Décision historique. L'opinion vous porte à un pic de popularité. Mais Bercy alerte sur l'impact budgétaire et les marchés sanctionnent immédiatement. Vous avez gagné le récit, pas encore la bataille.",
        events: [
          { day: "+5", label: "Création de la foncière autoroutière française", color: "gold" },
          { day: "+12", label: "Cote de confiance : +6 points", color: "green" },
          { day: "+18", label: "Spread OAT/Bund : +8 pb", color: "red" },
          { day: "+30", label: "Cour des comptes alerte sur le coût d'indemnisation", color: "yellow" },
        ],
      },
      C: {
        title: "Concurrence ouverte engagée",
        narrative: "Décision européenne et populaire. Mais trois concessionnaires saisissent le Conseil d'État. La procédure s'étale sur 18 mois. Vous avez déplacé la frontière du possible.",
        events: [
          { day: "+7", label: "Publication de l'appel d'offres au JOUE", color: "blue" },
          { day: "+14", label: "Manifestation d'intérêt d'opérateurs allemands et italiens", color: "green" },
          { day: "+25", label: "Trois recours déposés au Conseil d'État", color: "red" },
          { day: "+60", label: "Politico : « La France débloque le marché autoroutier européen »", color: "green" },
        ],
      },
    },
  },

  // ----------- DOSSIER 4 : LOGEMENT -----------
  {
    id: "logement",
    day: "J+34",
    tag: "Note d'arbitrage interministériel",
    title: "Crise du logement · plan d'urgence",
    subtitle: "Construction au plus bas depuis 1955 · 4,1 millions de mal-logés",
    summary: {
      contexte: "Les mises en chantier ont chuté de **−23,7% en 2024**[1]. La Fondation Abbé Pierre recense 4,1 millions de personnes mal logées. Le secteur du BTP a supprimé 60 000 emplois en deux ans.",
      enjeu: "Trois leviers possibles. Le choix engage la politique du logement pour cinq ans.",
    },
    sources: [
      "[1] SDES, ministère de la Transition écologique · 2025",
    ],
    agents: [
      { name: "Bercy", color: "red", stance: "RÉTICENTE", quote: "Tout choc fiscal aurait un impact direct sur le déficit. Marge limitée." },
      { name: "Maires de France", color: "gold", stance: "EN ATTENTE", quote: "Les communes ne peuvent porter seules le foncier et la construction." },
      { name: "Fédération BTP", color: "blue", stance: "MOBILISÉE", quote: "Sans choc d'offre, 100 000 emplois supplémentaires seront perdus." },
      { name: "Opinion publique", color: "muted", stance: "POLARISÉE 54/46", quote: "Forte attente sur le pouvoir d'achat. Division sur l'urbanisation." },
    ],
    scenarios: [
      {
        code: "SCÉNARIO A", color: "blue", title: "Choc d'offre fiscal", risk: "MARCHÉ",
        desc: "Restauration du dispositif Pinel renforcé. Exonérations sur droits de mutation pour primo-accédants. Coût budgétaire : 3,8 Md€/an.",
        tags: [["+ BTP", true], ["+ Classes moyennes", true], ["− Bercy", false]],
        deltas: { debt: +0.4, confidence: +3, parliament: +1, tension: -0.2, spread: +2 },
        signature: "A",
      },
      {
        code: "SCÉNARIO B", color: "gold", title: "Grand plan logement social", risk: "STRUCTUREL",
        desc: "200 000 logements sociaux/an pendant 5 ans. Reprise massive du foncier public. Financement par la Caisse des Dépôts.",
        tags: [["+ Mal-logés", true], ["+ Bailleurs sociaux", true], ["− Marchés", false]],
        deltas: { debt: +1.5, confidence: +5, parliament: +2, tension: -0.6, spread: +6 },
        signature: "B",
      },
      {
        code: "SCÉNARIO C", color: "muted", title: "Décentralisation totale", risk: "EXPÉRIMENTAL",
        desc: "Transfert intégral de la compétence logement aux régions. Dotation fléchée. L'État se retire.",
        tags: [["+ Régions", true], ["− Maires", false], ["± Bercy", null]],
        deltas: { debt: -0.2, confidence: -2, parliament: -3, tension: +0.4, spread: 0 },
        signature: "C",
      },
    ],
    consequences: {
      A: {
        title: "Choc d'offre fiscal engagé",
        narrative: "Les mises en chantier repartent : +18% en six mois. Mais les associations dénoncent un « cadeau aux promoteurs ». La fracture territoriale s'aggrave : les zones tendues captent 80% des aides.",
        events: [
          { day: "+15", label: "Décret Pinel renforcé publié au JO", color: "blue" },
          { day: "+30", label: "Mises en chantier : +12% en glissement annuel", color: "green" },
          { day: "+45", label: "Fondation Abbé Pierre dénonce un « plan inégalitaire »", color: "red" },
          { day: "+60", label: "Cour des comptes interroge l'efficacité du dispositif", color: "yellow" },
        ],
      },
      B: {
        title: "Plan logement social lancé",
        narrative: "Décision saluée par les associations et les bailleurs sociaux. Mais le déficit se creuse et Bruxelles s'inquiète. Les premières livraisons n'arriveront qu'en année 2.",
        events: [
          { day: "+10", label: "Signature avec la Caisse des Dépôts · enveloppe 8 Md€", color: "gold" },
          { day: "+25", label: "Fondation Abbé Pierre salue « un acte historique »", color: "green" },
          { day: "+40", label: "Spread OAT/Bund s'écarte de 6 pb", color: "red" },
          { day: "+70", label: "Première inauguration de 1 200 logements à Lyon", color: "blue" },
        ],
      },
      C: {
        title: "Décentralisation actée",
        narrative: "Les régions se félicitent. Mais les disparités explosent dès le premier semestre. L'Île-de-France et PACA ne suivent pas la même politique que la Bretagne. L'unité républicaine du logement vacille.",
        events: [
          { day: "+20", label: "Loi votée à l'Assemblée · 290 voix pour", color: "blue" },
          { day: "+50", label: "Association des maires dénonce un « abandon de l'État »", color: "red" },
          { day: "+75", label: "Disparités régionales : facteur 4 entre territoires", color: "red" },
          { day: "+90", label: "Premières critiques sur la « République à plusieurs vitesses »", color: "yellow" },
        ],
      },
    },
  },

  // ----------- DOSSIER 5 : ÉNERGIE -----------
  {
    id: "energie",
    day: "J+56",
    tag: "Note d'arbitrage stratégique",
    title: "Stratégie énergétique 2035",
    subtitle: "Mix nucléaire/renouvelable · investissement 250 Md€ à 10 ans",
    summary: {
      contexte: "La consommation électrique française augmentera de **+40% d'ici 2035**[1] (véhicules électriques, IA, réindustrialisation). EDF présente trois trajectoires structurellement différentes.",
      enjeu: "Le choix engage la France pour 30 ans et conditionne la stratégie industrielle européenne.",
    },
    sources: [
      "[1] RTE · Futurs énergétiques 2050",
    ],
    agents: [
      { name: "EDF", color: "blue", stance: "PRO-NUCLÉAIRE", quote: "Six EPR supplémentaires sont la seule trajectoire de souveraineté." },
      { name: "Écologistes", color: "green", stance: "OPPOSITION FRONTALE", quote: "Le nucléaire est un piège budgétaire. 100% renouvelable est possible." },
      { name: "Bruxelles", color: "gold", stance: "FAVORABLE NUCLÉAIRE", quote: "Le mix nucléaire/renouvelable est compatible avec le Green Deal." },
      { name: "Industriels", color: "muted", stance: "EXIGEANTS", quote: "Sans visibilité prix à 10 ans, pas de relocalisation possible." },
    ],
    scenarios: [
      {
        code: "SCÉNARIO A", color: "blue", title: "Nouveau cycle nucléaire", risk: "SOUVERAINETÉ",
        desc: "Construction de 6 EPR2 + prolongation du parc existant. Investissement 180 Md€. Mise en service 2035-2042.",
        tags: [["+ EDF", true], ["+ Industriels", true], ["− Écologistes", false]],
        deltas: { debt: +1.8, confidence: +4, parliament: +3, tension: +0.5, spread: +5 },
        signature: "A",
      },
      {
        code: "SCÉNARIO B", color: "green", title: "Bascule renouvelables", risk: "TRANSITION",
        desc: "Massif renouvelable : éolien offshore, solaire, hydrogène. Sortie progressive du nucléaire d'ici 2050.",
        tags: [["+ Jeunesse", true], ["+ Écologistes", true], ["− EDF", false], ["− Souveraineté", false]],
        deltas: { debt: +2.2, confidence: +5, parliament: -2, tension: +0.8, spread: +9 },
        signature: "B",
      },
      {
        code: "SCÉNARIO C", color: "gold", title: "Mix équilibré accéléré", risk: "PRAGMATIQUE",
        desc: "3 EPR2 + déploiement renouvelable massif. Coexistence des deux filières. Investissement 130 Md€.",
        tags: [["+ Bruxelles", true], ["± Tous les camps", null], ["− Idéologues", false]],
        deltas: { debt: +1.4, confidence: +3, parliament: +1, tension: -0.2, spread: +4 },
        signature: "C",
      },
    ],
    consequences: {
      A: {
        title: "Nouveau cycle nucléaire engagé",
        narrative: "EDF salue la décision. Les industriels confirment leurs projets de relocalisation. Mais l'aile écologiste de votre majorité menace de quitter le gouvernement. Les manifestations à Bure et Flamanville reprennent.",
        events: [
          { day: "+12", label: "Annonce officielle de 6 EPR2 à Penly, Gravelines, Bugey", color: "gold" },
          { day: "+25", label: "Démission de deux ministres écologistes", color: "red" },
          { day: "+45", label: "Trois industriels annoncent leur retour en France", color: "green" },
          { day: "+70", label: "Manifestations à Flamanville · 15 000 personnes", color: "yellow" },
        ],
      },
      B: {
        title: "Bascule renouvelables engagée",
        narrative: "L'annonce fait événement européen. Mais EDF alerte sur la faisabilité technique et les industriels gèlent leurs investissements. Le pari est posé : tout dépend du rythme effectif de déploiement.",
        events: [
          { day: "+8", label: "Plan d'investissement 220 Md€ présenté", color: "green" },
          { day: "+22", label: "EDF demande un sommet de crise", color: "red" },
          { day: "+40", label: "Trois industriels gèlent leurs projets français", color: "red" },
          { day: "+65", label: "Visite d'État allemande pour partenariat hydrogène", color: "blue" },
        ],
      },
      C: {
        title: "Mix équilibré accéléré engagé",
        narrative: "Décision saluée par Bruxelles et la plupart des acteurs. Mais critiquée par les idéologues des deux camps. La voie médiane porte les coûts des deux stratégies sans la lisibilité d'aucune.",
        events: [
          { day: "+10", label: "Loi-programme énergie présentée en Conseil des ministres", color: "blue" },
          { day: "+30", label: "Bruxelles débloque 12 Md€ de financements européens", color: "green" },
          { day: "+50", label: "Critiques croisées des écologistes et pro-nucléaires", color: "yellow" },
          { day: "+80", label: "Premier appel d'offres éolien offshore 4 GW lancé", color: "blue" },
        ],
      },
    },
  },

  // ----------- DOSSIER 6 : SÉCURITÉ -----------
  {
    id: "securite",
    day: "J+62",
    tag: "Note d'arbitrage régalien",
    title: "Plan sécurité du quotidien",
    subtitle: "Refus de plainte · violences intra-familiales · narcotrafic",
    summary: {
      contexte: "Les refus de plainte ont augmenté de **+18% en 2024**[1]. Les violences intra-familiales atteignent un pic historique. Le narcotrafic structure désormais 12 quartiers prioritaires de l'agglomération marseillaise.",
      enjeu: "Trois doctrines possibles. Chacune engage la philosophie sécuritaire du mandat.",
    },
    sources: [
      "[1] Service statistique ministériel de la sécurité intérieure",
    ],
    agents: [
      { name: "Police nationale", color: "blue", stance: "DEMANDEUSE", quote: "Manque structurel d'effectifs et de moyens techniques sur le narcotrafic." },
      { name: "Magistrats", color: "gold", stance: "VIGILANTS", quote: "Toute extension de garde à vue posera une question constitutionnelle." },
      { name: "Associations", color: "red", stance: "MOBILISÉES", quote: "Les violences intra-familiales ne peuvent plus être traitées comme un sous-sujet." },
      { name: "Opinion publique", color: "muted", stance: "INQUIÈTE 71%", quote: "L'insécurité est la 2e préoccupation des Français après le pouvoir d'achat." },
    ],
    scenarios: [
      {
        code: "SCÉNARIO A", color: "blue", title: "Plan fermeté narcotrafic", risk: "RÉGALIEN",
        desc: "8 000 policiers supplémentaires sur l'agglomération marseillaise. Saisies automatiques des avoirs criminels. Tribunaux dédiés.",
        tags: [["+ Police", true], ["+ Opinion", true], ["− Magistrats", false]],
        deltas: { debt: +0.4, confidence: +5, parliament: +3, tension: -0.3, spread: 0 },
        signature: "A",
      },
      {
        code: "SCÉNARIO B", color: "red", title: "Priorité violences intra-familiales", risk: "SOCIAL",
        desc: "Doublement des moyens spécialisés. Brigade dédiée dans chaque département. Plan formation magistrats.",
        tags: [["+ Associations", true], ["+ Femmes", true], ["− Effet d'annonce", false]],
        deltas: { debt: +0.3, confidence: +4, parliament: +1, tension: -0.5, spread: 0 },
        signature: "B",
      },
      {
        code: "SCÉNARIO C", color: "gold", title: "Plan global proximité", risk: "ÉQUILIBRE",
        desc: "Police de proximité réactivée. Médiateurs scolaires. Brigades narcotrafic et VIF coordonnées. Investissement 1,8 Md€.",
        tags: [["± Tous les acteurs", null], ["+ Maires", true], ["− Lisibilité", false]],
        deltas: { debt: +0.6, confidence: +3, parliament: +2, tension: -0.4, spread: +1 },
        signature: "C",
      },
    ],
    consequences: {
      A: {
        title: "Plan fermeté narcotrafic engagé",
        narrative: "8 000 policiers déployés à Marseille en six semaines. Saisies record. Mais le Conseil constitutionnel censure trois dispositions. Et les violences intra-familiales restent un angle mort.",
        events: [
          { day: "+14", label: "Premier convoi de 1 200 policiers déployé à Marseille", color: "blue" },
          { day: "+30", label: "Saisies records : 280 M€ d'avoirs criminels", color: "green" },
          { day: "+50", label: "Conseil constitutionnel censure 3 dispositions", color: "red" },
          { day: "+75", label: "Associations VIF dénoncent un angle mort politique", color: "red" },
        ],
      },
      B: {
        title: "Plan VIF lancé",
        narrative: "Décision historique saluée par les associations. Le 3919 est saturé pendant 48h. Mais l'opposition vous attaque sur le narcotrafic et l'opinion juge le plan insuffisant face à l'insécurité globale.",
        events: [
          { day: "+7", label: "Annonce du plan VIF en discours national", color: "gold" },
          { day: "+12", label: "Le 3919 saturé · +340% d'appels", color: "blue" },
          { day: "+30", label: "Premières brigades départementales opérationnelles", color: "green" },
          { day: "+55", label: "Opposition : « Et le narcotrafic ? »", color: "red" },
        ],
      },
      C: {
        title: "Plan global proximité engagé",
        narrative: "Tous les acteurs trouvent un peu de leur cause dans le plan. Aucun n'est pleinement satisfait. Six mois plus tard, les indicateurs s'améliorent légèrement sans qu'aucun récit fort ne se dégage.",
        events: [
          { day: "+10", label: "Loi-cadre sécurité du quotidien votée à 295 voix", color: "blue" },
          { day: "+30", label: "Première brigade coordonnée VIF/narcotrafic à Lyon", color: "green" },
          { day: "+60", label: "Indicateurs sécurité : −4% en moyenne", color: "green" },
          { day: "+80", label: "Critiques sur l'invisibilité médiatique du plan", color: "yellow" },
        ],
      },
    },
  },
];

// Convertit les noms de couleurs symboliques en valeurs hex
function resolveColor(name) {
  const map = {
    blue: COLORS.blue, red: COLORS.red, redLight: COLORS.redLight,
    green: COLORS.green, gold: COLORS.gold, yellow: COLORS.yellow,
    muted: COLORS.textMuted, navy: COLORS.navy,
  };
  return map[name] || COLORS.textMuted;
}

// Remplace les **mots** par du gras dans un texte
function renderRich(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} style={{ color: COLORS.navy, fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function Page() {
  // Tirage aléatoire de 2 dossiers à chaque session
  const [selectedDossiers] = useState(() => {
    const shuffled = [...CATALOGUE_DOSSIERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  });

  const [section, setSection] = useState(SECTIONS.intro);
  const [choices, setChoices] = useState({});
  const [indicators, setIndicators] = useState({
    debt: 115.6, confidence: 52, parliament: 287, tension: 4.2, spread: 64,
  });

  const dossier1 = selectedDossiers[0];
  const dossier2 = selectedDossiers[1];

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
    <main style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "system-ui, -apple-system, sans-serif", padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px 80px" }}>
        <Header section={section} />

        {section === SECTIONS.intro && <Intro onStart={() => setSection(SECTIONS.dossier1)} />}

        {section === SECTIONS.dossier1 && (
          <DossierView
            dossier={dossier1} indicators={indicators}
            onChoice={(sig, deltas) => { recordChoice("d1", sig, deltas); setSection(SECTIONS.consequence1); }}
          />
        )}

        {section === SECTIONS.consequence1 && (
          <ConsequenceView
            dossier={dossier1} choice={choices.d1} indicators={indicators}
            onContinue={() => setSection(SECTIONS.dossier2)}
          />
        )}

        {section === SECTIONS.dossier2 && (
          <DossierView
            dossier={dossier2} indicators={indicators}
            onChoice={(sig, deltas) => { recordChoice("d2", sig, deltas); setSection(SECTIONS.consequence2); }}
          />
        )}

        {section === SECTIONS.consequence2 && (
          <ConsequenceView
            dossier={dossier2} choice={choices.d2} indicators={indicators}
            onContinue={() => setSection(SECTIONS.profile)}
          />
        )}

        {section === SECTIONS.profile && (
          <Profile choices={choices} indicators={indicators} dossiers={[dossier1, dossier2]} onRestart={() => window.location.reload()} />
        )}

        <Footer />
      </div>
    </main>
  );
}

// ============================================================
// HEADER + FOOTER
// ============================================================

function Header({ section }) {
  const steps = ["intro", "dossier1", "consequence1", "dossier2", "consequence2", "profile"];
  const currentIdx = steps.indexOf(section);
  return (
    <div style={{ marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-block", width: 7, height: 7, background: COLORS.gold, borderRadius: "50%" }}></span>
          <span style={{ color: COLORS.navy, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Republica · Prototype</span>
        </div>
        <span style={{ color: COLORS.textDim, fontFamily: "ui-monospace, monospace", fontSize: 10, letterSpacing: "0.1em" }}>
          ÉTAPE {currentIdx + 1} / {steps.length}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 3, background: i <= currentIdx ? COLORS.navy : COLORS.border, transition: "background 0.3s" }} />
        ))}
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
        Prototype de démonstration — 2026
      </div>
    </div>
  );
}

// ============================================================
// SECTION INTRO
// ============================================================

function Intro({ onStart }) {
  return (
    <Section>
      <Tag>— Investiture présidentielle —</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 36, fontWeight: 600, color: COLORS.navy, lineHeight: 1.1, margin: "0 0 18px", letterSpacing: "-0.01em" }}>
        Vous venez d'être élu Président de la République.
      </h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 17, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 26px" }}>
        Cent jours pour imprimer votre marque. Huit centres de pouvoir vous attendent : Bercy, les syndicats, Bruxelles, l'opinion, les médias, les marchés, le Conseil d'État, les collectivités. Chaque décision aura des conséquences. Aucune ne fera l'unanimité.
      </p>

      <div style={{ background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.gold}`, padding: 16, margin: "0 0 22px" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 600 }}>◊ ÉTAT DE LA NATION · DONNÉES VÉRIFIÉES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 1, background: COLORS.border }}>
          <Stat label="Dette / PIB" value="115,6%" note="INSEE 2025" />
          <Stat label="Déficit" value="5,1%" note="du PIB" />
          <Stat label="Croissance" value="1,1%" note="annuelle" />
          <Stat label="Chômage" value="7,3%" note="BIT" />
        </div>
      </div>

      <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 28px" }}>
        Ceci est une simulation prospective IA. Les chiffres de départ sont vérifiés. Les conséquences sont des projections narratives, non des prévisions économétriques. <strong style={{ color: COLORS.navy }}>Chaque relance propose deux dossiers tirés au hasard parmi un catalogue.</strong>
      </p>

      <BigButton onClick={onStart}>Prendre mes fonctions ↗</BigButton>
    </Section>
  );
}

// ============================================================
// VUE D'UN DOSSIER (générique)
// ============================================================

function DossierView({ dossier, indicators, onChoice }) {
  const isUrgent = dossier.urgent;

  return (
    <Section>
      <Dashboard indicators={indicators} />

      {isUrgent && (
        <div style={{ background: `${COLORS.red}10`, border: `1px solid ${COLORS.red}40`, padding: 14, marginBottom: 18, borderLeft: `3px solid ${COLORS.red}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: COLORS.red, borderRadius: "50%" }}></span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.red, letterSpacing: "0.2em", fontWeight: 600 }}>DÉPÊCHE ENTRANTE · {dossier.day}</span>
          </div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14.5, color: COLORS.navy, lineHeight: 1.55, fontWeight: 500 }}>
            {dossier.subtitle}
          </div>
        </div>
      )}

      <Tag>{dossier.tag} · {dossier.day}</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 27, fontWeight: 600, color: COLORS.navy, lineHeight: 1.15, margin: "0 0 4px", letterSpacing: "-0.01em" }}>
        {dossier.title}
      </h1>
      {!isUrgent && (
        <div style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: "italic", marginBottom: 18 }}>
          {dossier.subtitle}
        </div>
      )}

      <ExecutiveSummary>
        <p style={{ margin: "0 0 8px" }}>
          <strong style={{ color: COLORS.gold, fontWeight: 600 }}>Contexte.</strong> {renderRich(dossier.summary.contexte)}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: COLORS.gold, fontWeight: 600 }}>Enjeu.</strong> {renderRich(dossier.summary.enjeu)}
        </p>
        <Sources>
          {dossier.sources.map((s, i) => (
            <div key={i}>{s.split("]").map((part, j) => j === 0 ? <span key={j} style={{ color: COLORS.gold }}>{part}]</span> : part)}</div>
          ))}
        </Sources>
      </ExecutiveSummary>

      {dossier.nouvelleEnergie && (
        <NouvelleEnergie>
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: COLORS.gold, fontWeight: 600 }}>Donnée vérifiée —</strong> {dossier.nouvelleEnergie.verified}
          </p>
          <div style={{ marginTop: 10, padding: "12px 14px", background: `${COLORS.gold}12`, borderLeft: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 6, fontWeight: 600 }}>◊ PROPOSITION ALTERNATIVE</div>
            <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14, color: COLORS.navy, lineHeight: 1.6 }}>
              {renderRich(dossier.nouvelleEnergie.proposal)}
            </div>
          </div>
        </NouvelleEnergie>
      )}

      <SubTag>Centres de pouvoir · positions exprimées</SubTag>
      <AgentsGrid>
        {dossier.agents.map((a, i) => (
          <Agent key={i} name={a.name} color={resolveColor(a.color)} stance={a.stance} quote={a.quote} />
        ))}
      </AgentsGrid>

      <SubTag>Votre arbitrage · {dossier.scenarios.length} voies</SubTag>
      {dossier.scenarios.map((s, i) => (
        <ScenarioButton
          key={i} code={s.code} color={resolveColor(s.color)} title={s.title} risk={s.risk}
          desc={s.desc} tags={s.tags.map(([label, positive]) => ({ label, positive }))}
          onClick={() => onChoice(s.signature, s.deltas)}
        />
      ))}
    </Section>
  );
}

// ============================================================
// VUE DES CONSÉQUENCES
// ============================================================

function ConsequenceView({ dossier, choice, indicators, onContinue }) {
  const data = dossier.consequences[choice];
  return (
    <Section>
      <Dashboard indicators={indicators} highlight />
      <Tag>◊ Conséquences de votre arbitrage</Tag>
      <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 25, fontWeight: 600, color: COLORS.navy, lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
        {data.title}
      </h1>
      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 15, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 22px" }}>
        {data.narrative}
      </p>
      <SubTag>Chronologie des semaines suivantes</SubTag>
      <Timeline events={data.events} />
      <BigButton onClick={onContinue}>Suite du mandat ↗</BigButton>
    </Section>
  );
}

// ============================================================
// SECTION PROFIL POLITIQUE
// ============================================================

function Profile({ choices, indicators, dossiers, onRestart }) {
  const family = useMemo(() => classifyFamily(choices, dossiers, indicators), [choices, dossiers, indicators]);

  return (
    <Section>
      <Tag>— Votre famille politique —</Tag>

      <div style={{ textAlign: "center", padding: "22px 24px", border: `1px solid ${COLORS.navy}30`, background: COLORS.bgPanel, margin: "0 0 24px", position: "relative" }}>
        <div style={{ position: "absolute", top: 8, right: 10, fontFamily: "ui-monospace, monospace", fontSize: 9, color: COLORS.textDim, letterSpacing: "0.15em" }}>N° 048</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: COLORS.gold, letterSpacing: "0.25em", marginBottom: 8, fontWeight: 600 }}>CLASSIFICATION</div>
        <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 30, fontWeight: 600, color: COLORS.navy, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {family.label}
        </div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.15em", marginTop: 12 }}>
          PROCHE DE : {family.closeTo}
        </div>
      </div>

      <p style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 15, color: COLORS.text, lineHeight: 1.7, fontStyle: "italic", textAlign: "center", margin: "0 0 28px" }}>
        « {family.tagline} »
      </p>

      <SubTag>État final de votre mandat</SubTag>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 1, background: COLORS.border, marginBottom: 24 }}>
        <Stat label="Dette / PIB" value={`${indicators.debt}%`} note={delta(indicators.debt - 115.6)} />
        <Stat label="Confiance" value={`${indicators.confidence}%`} note={delta(indicators.confidence - 52)} />
        <Stat label="Soutien AN" value={`${indicators.parliament}`} note={delta(indicators.parliament - 287)} />
        <Stat label="Tension" value={`${indicators.tension}/10`} note={delta(indicators.tension - 4.2)} />
      </div>

      <SubTag>Carte de partage · #MES100JOURS</SubTag>
      <div style={{ background: `linear-gradient(140deg, ${COLORS.navy} 0%, ${COLORS.bgDarker} 100%)`, border: `1px solid ${COLORS.gold}40`, padding: "26px 22px", position: "relative", overflow: "hidden", marginBottom: 26, color: COLORS.textOnDark }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontFamily: "ui-serif, Georgia, serif", fontSize: 150, color: `${COLORS.gold}12`, fontWeight: 600, lineHeight: 1 }}>R</div>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.gold, letterSpacing: "0.25em", marginBottom: 14, fontWeight: 600 }}>REPUBLICA · MES 100 JOURS</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 20, fontWeight: 500, color: COLORS.textOnDark, lineHeight: 1.2 }}>J'ai gouverné en</div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 26, fontWeight: 600, color: COLORS.gold, lineHeight: 1.1, fontStyle: "italic", marginBottom: 16 }}>
            {family.shortLabel}
          </div>
          <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13.5, color: "#e0dcd3", lineHeight: 1.6, fontStyle: "italic", padding: "12px 0", borderTop: `1px solid ${COLORS.gold}30`, borderBottom: `1px solid ${COLORS.gold}30`, marginBottom: 14 }}>
            « {family.shareQuote} »
          </div>
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
          Ceci est un prototype non commercial. La version finale proposera 60 dossiers de réforme, un mandat complet de 100 jours, des conséquences générées par IA en temps réel, et un comparatif anonymisé entre tous les joueurs.
        </p>
      </div>
    </Section>
  );
}

// Classification politique étendue
function classifyFamily(choices, dossiers, indicators) {
  // On évalue la "tonalité" de chaque choix pour classer
  let liberal = 0, social = 0, autorite = 0, europe = 0;

  [choices.d1, choices.d2].forEach((c, idx) => {
    const d = dossiers[idx];
    if (!d || !c) return;
    const sc = d.scenarios.find(s => s.signature === c);
    if (!sc) return;

    // Heuristique simple : on regarde les deltas et les tags
    if (sc.deltas.debt < 0) liberal += 1;
    if (sc.deltas.debt > 0.5) social += 1;
    if (sc.deltas.confidence > 4 && sc.deltas.tension > 0) autorite += 1;
    if (sc.signature === "european" || sc.code.includes("européen")) europe += 2;
  });

  // Classification finale
  if (autorite >= 2) return {
    label: "Droite conservatrice", shortLabel: "Droite conservatrice",
    closeTo: "Tradition gaulliste régalienne",
    tagline: "Vous gouvernez par la fermeté. Votre boussole : l'autorité, la responsabilité, le refus du compromis perçu comme faiblesse.",
    shareQuote: "J'ai tranché, j'ai assumé. Le pays plie, il ne se rompt pas.",
    pct: 22,
  };
  if (europe >= 2) return {
    label: "Centre · social-européen", shortLabel: "Centre social-européen",
    closeTo: "Sociale-démocratie réformiste",
    tagline: "Vous croyez à la négociation comme méthode et à l'Europe comme cadre. La stabilité avant la rupture, le collectif avant le geste.",
    shareQuote: "J'ai négocié, j'ai européanisé. Le pays avance sans se déchirer.",
    pct: 16,
  };
  if (liberal >= 2) return {
    label: "Centre-droit · libéral européen", shortLabel: "Centre-droit libéral",
    closeTo: "Macronisme première manière",
    tagline: "Vous croyez à la rigueur budgétaire et à l'ouverture économique. Vous tranchez sur le fond, vous coopérez sur les moyens.",
    shareQuote: "Réforme structurelle et discipline. J'ai assumé les deux.",
    pct: 19,
  };
  if (social >= 2) return {
    label: "Centre-gauche · réformiste social", shortLabel: "Centre-gauche social",
    closeTo: "Tradition rocardienne",
    tagline: "Vous croyez à la justice sociale comme moteur du progrès. Vous investissez là où d'autres coupent.",
    shareQuote: "J'ai investi dans le pays. La dette monte, mais le pays se reconstruit.",
    pct: 14,
  };
  if (liberal >= 1 && europe >= 1) return {
    label: "Centre · technocratique", shortLabel: "Centre technocratique",
    closeTo: "Tradition giscardienne",
    tagline: "Vous croyez à la méthode plus qu'à la rupture. Vous tranchez, mais sans bruit. Vous gouvernez plus que vous ne politisez.",
    shareQuote: "Pas de feuilleton, juste des résultats.",
    pct: 13,
  };
  return {
    label: "Gauche radicale · contestataire", shortLabel: "Gauche radicale",
    closeTo: "Tradition contestataire",
    tagline: "Vous refusez les cadres imposés : pas de réforme contre les salariés, pas de soumission aux marchés.",
    shareQuote: "J'ai refusé les cadres. J'ai gouverné à contre-courant.",
    pct: 9,
  };
}

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

function Section({ children }) { return <div style={{ padding: "8px 0" }}>{children}</div>; }

function Tag({ children }) {
  return <div style={{ fontSize: 11, color: COLORS.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>{children}</div>;
}

function SubTag({ children }) {
  return <div style={{ fontSize: 11, color: COLORS.textDim, letterSpacing: "0.2em", textTransform: "uppercase", margin: "22px 0 14px", fontWeight: 600 }}>{children}</div>;
}

function Sources({ children }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, fontFamily: "ui-monospace, monospace", fontSize: 10, color: COLORS.textDim, lineHeight: 1.8 }}>
      {children}
    </div>
  );
}

function ExecutiveSummary({ children }) {
  return (
    <div style={{ padding: 16, background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.gold}`, marginBottom: 18 }}>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: COLORS.gold, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 600 }}>— EXECUTIVE SUMMARY —</div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 14, color: COLORS.text, lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

function NouvelleEnergie({ children }) {
  return (
    <div style={{ padding: 16, background: COLORS.bgPanel, border: `1px solid ${COLORS.gold}40`, marginBottom: 18, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "ui-monospace, monospace", fontSize: 9, color: "#fff", fontWeight: 700 }}>NE</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>Nouvelle Énergie</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" }}>Contre-expertise indépendante</div>
        </div>
      </div>
      <div style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: 13.5, color: COLORS.text, lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

function Dashboard({ indicators, highlight }) {
  return (
    <div style={{ background: COLORS.bgPanel, padding: "14px 16px", marginBottom: 20, border: `1px solid ${highlight ? COLORS.gold : COLORS.border}` }}>
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
    <div style={{ padding: "12px 14px", background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${color}` }}>
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
      style={{
        width: "100%", textAlign: "left", padding: "16px 18px",
        background: COLORS.bgPanel, border: `1px solid ${color}50`, borderLeft: `3px solid ${color}`,
        color: COLORS.text, cursor: "pointer", marginBottom: 10, fontFamily: "inherit", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}06`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.background = COLORS.bgPanel; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7, flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color, letterSpacing: "0.1em", fontWeight: 700 }}>{code}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{title}</span>
        </div>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9.5, color: COLORS.textDim, fontWeight: 600 }}>{risk}</span>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 8 }}>{desc}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, fontFamily: "ui-monospace, monospace", fontSize: 10 }}>
        {tags.map((t, i) => (
          <span key={i} style={{
            padding: "3px 8px",
            background: t.positive === true ? `${COLORS.green}15` : t.positive === false ? `${COLORS.red}12` : `${COLORS.yellow}15`,
            color: t.positive === true ? COLORS.green : t.positive === false ? COLORS.red : COLORS.yellow,
            fontWeight: 600,
          }}>{t.label}</span>
        ))}
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
      style={{
        width: "100%", padding: "16px 22px",
        background: COLORS.navy, border: "none", color: COLORS.textOnDark,
        fontFamily: "ui-monospace, monospace", fontSize: 13, letterSpacing: "0.2em",
        cursor: "pointer", textTransform: "uppercase", fontWeight: 600, transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.navyLight; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.navy; }}
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
