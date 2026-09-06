"use client";

const COLORS = {
  bgGradient: "linear-gradient(180deg, #FF2E93 0%, #B026FF 100%)",
  magenta: "#FF2E93",
  violet: "#B026FF",
  lime: "#D6FF00",
  ink: "#14121A",
  inkSoft: "#5C5266",
  white: "#FFFFFF",
  whiteSoft: "rgba(255,255,255,0.85)",
  whiteDim: "rgba(255,255,255,0.6)",
};

export default function About() {
  return (
    <main style={{
      minHeight: "100vh",
      background: COLORS.bgGradient,
      color: COLORS.white,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: 0,
      margin: 0,
    }}>
      <div style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 20px 60px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <a href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}>
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
            }}>Moi Président(e)</span>
          </a>
          <a href="/" style={{
            fontSize: 12,
            color: COLORS.whiteSoft,
            textDecoration: "none",
            letterSpacing: "1px",
          }}>← RETOUR</a>
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-block",
          background: COLORS.lime,
          borderRadius: 32,
          padding: "8px 16px",
          marginBottom: 24,
        }}>
          <span style={{ color: COLORS.ink, fontSize: 13, fontWeight: 500 }}>◊ À PROPOS</span>
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: 44,
          fontWeight: 500,
          color: COLORS.white,
          lineHeight: 1.05,
          margin: "0 0 24px",
          letterSpacing: "-2px",
        }}>
          Un jeu.<br/>
          <span style={{ color: COLORS.lime }}>Pas un manifeste.</span>
        </h1>

        <p style={{ fontSize: 17, color: COLORS.whiteSoft, lineHeight: 1.55, margin: "0 0 32px" }}>
          Moi Président(e) est une simulation politique française, courte et rejouable. Un dossier chaud, trois voies possibles, et vos conséquences. Rien de plus.
        </p>

        {/* Section : Concept */}
        <div style={{
          background: COLORS.white,
          borderRadius: 22,
          padding: "24px 24px",
          marginBottom: 20,
          boxShadow: "0 6px 20px rgba(20,18,26,0.2)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: COLORS.magenta,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 700,
            }}>1</div>
            <h2 style={{
              fontSize: 18,
              color: COLORS.ink,
              fontWeight: 500,
              margin: 0,
              letterSpacing: "-0.4px",
            }}>Ce que c'est</h2>
          </div>
          <p style={{
            fontSize: 14.5,
            color: COLORS.ink,
            lineHeight: 1.6,
            margin: "0 0 10px",
          }}>
            Chaque partie vous met dans la peau du Président de la République face à un dossier concret : une crise sociale, une décision européenne, un arbitrage économique, un choix de société. Vos équipes vous proposent trois solutions. À vous d'arbitrer.
          </p>
          <p style={{
            fontSize: 14.5,
            color: COLORS.ink,
            lineHeight: 1.6,
            margin: 0,
          }}>
            À la fin, vous découvrez les conséquences de votre décision sur 90 jours, et l'archétype de président que vous avez incarné.
          </p>
        </div>

        {/* Section : Avertissement */}
        <div style={{
          background: COLORS.white,
          borderRadius: 22,
          padding: "24px 24px",
          marginBottom: 20,
          boxShadow: "0 6px 20px rgba(20,18,26,0.2)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: COLORS.magenta,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 700,
            }}>2</div>
            <h2 style={{
              fontSize: 18,
              color: COLORS.ink,
              fontWeight: 500,
              margin: 0,
              letterSpacing: "-0.4px",
            }}>Ce que ce n'est pas</h2>
          </div>
          <p style={{
            fontSize: 14.5,
            color: COLORS.ink,
            lineHeight: 1.6,
            margin: "0 0 10px",
          }}>
            Ce n'est ni un test politique sérieux, ni un simulateur ENA. Les dossiers, chiffres et conséquences sont générés en temps réel par intelligence artificielle. Aucune partie n'est identique.
          </p>
          <p style={{
            fontSize: 14.5,
            color: COLORS.ink,
            lineHeight: 1.6,
            margin: 0,
          }}>
            Les données macroéconomiques initiales sont vérifiées (INSEE, Banque de France). Les conséquences que vous verrez sont des projections plausibles générées par IA, à prendre avec du recul.
          </p>
        </div>

        {/* Section : Equipe */}
        <div style={{
          background: COLORS.white,
          borderRadius: 22,
          padding: "24px 24px",
          marginBottom: 20,
          boxShadow: "0 6px 20px rgba(20,18,26,0.2)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: COLORS.magenta,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 700,
            }}>3</div>
            <h2 style={{
              fontSize: 18,
              color: COLORS.ink,
              fontWeight: 500,
              margin: 0,
              letterSpacing: "-0.4px",
            }}>Qui c'est</h2>
          </div>
          <p style={{
            fontSize: 14.5,
            color: COLORS.ink,
            lineHeight: 1.6,
            margin: "0 0 10px",
          }}>
            Moi Président(e) est une production des Energiseurs, noyau IA des militants Nouvelle Energie.
          </p>
          <p style={{
            fontSize: 14.5,
            color: COLORS.ink,
            lineHeight: 1.6,
            margin: 0,
          }}>
            L'objectif : redonner le goût de la politique à ceux qui l'ont perdu. En vous mettant dans la peau d'un décideur, cette simulation cherche à faire ressentir la complexité concrète du pouvoir, au-delà des slogans.
          </p>
        </div>

        {/* Section technique */}
        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          borderRadius: 22,
          padding: "20px 22px",
          marginBottom: 24,
        }}>
          <p style={{
            fontSize: 11,
            color: COLORS.lime,
            fontWeight: 700,
            letterSpacing: "2px",
            margin: "0 0 12px",
          }}>◊ TECHNIQUE</p>
          <p style={{
            fontSize: 13,
            color: COLORS.white,
            lineHeight: 1.55,
            margin: "0 0 8px",
          }}>
            Chaque dossier est généré en temps réel par Claude (Anthropic). Les statistiques anonymes sont hébergées sur Airtable. Aucune donnée personnelle n'est collectée sans votre accord explicite.
          </p>
          <p style={{
            fontSize: 13,
            color: COLORS.whiteSoft,
            lineHeight: 1.55,
            margin: 0,
          }}>
            Code, données, analytics : voir <a href="/mentions-legales" style={{ color: COLORS.lime, textDecoration: "underline" }}>Mentions légales</a> et <a href="/confidentialite" style={{ color: COLORS.lime, textDecoration: "underline" }}>Confidentialité</a>.
          </p>
        </div>

        {/* CTA final */}
        <a href="/" style={{
          display: "block",
          width: "100%",
          background: COLORS.lime,
          color: COLORS.ink,
          textAlign: "center",
          padding: "18px 24px",
          fontSize: 16,
          fontWeight: 500,
          textDecoration: "none",
          borderRadius: 18,
          boxShadow: "0 4px 20px rgba(214,255,0,0.4)",
          boxSizing: "border-box",
        }}>
          Jouer →
        </a>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          marginTop: 24,
          fontSize: 11,
          color: COLORS.whiteDim,
          letterSpacing: "1px",
        }}>
          MOI PRÉSIDENT(E)
        </p>
      </div>
    </main>
  );
}
