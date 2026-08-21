import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, HERO_IMAGE, HERO_STATS, HERO_TECH } from "../../constants";
import "./header.css";

export default function Header() {
  const [active, setActive] = useState<string>("travel");

  const current = CATEGORIES.find((c: { key: string }) => c.key === active)!;

  return (
    <section className="hero">
      <div className="heroGrid"></div>
      <div className="heroGlow heroGlowPrimary"></div>
      <div className="heroGlow heroGlowSecondary"></div>

      <div className="heroContainer">
        <div className="heroLeft">
          <div className="heroPill">
            <span className="heroPulse"></span>
            <span>Open to new experiences</span>
          </div>

          <p className="heroMono">
            <span className="heroMonoDollar">$</span> whoami
          </p>

          <h1 className="heroTitle">
            Welcome to{" "}
            <span className="text-gradient-primary">roamly</span>.
            <br />
            <span className="heroTitleSub">
              I explore the world through{" "}
            </span>
            <span className="text-gradient-secondary" key={active}>
              {active === "travel" && "travel & adventures"}
              {active === "food" && "food & flavors"}
              {active === "code" && "code & creativity"}
            </span>
            .
          </h1>

          <p className="heroDesc">
            {active === "travel" &&
              "Documenting journeys across mountains, cities, and coastlines. Every trip tells a story worth sharing."}
            {active === "food" &&
              "From street food stalls to hidden restaurants — capturing the flavors that make each destination unique."}
            {active === "code" &&
              "Building full-stack applications and sharing the journey. React, Node, and everything in between."}
          </p>

          <div className="heroSwitcher">
            {CATEGORIES.map((cat: { key: string; icon: string; label: string }) => (
              <button
                key={cat.key}
                className={`heroSwitchBtn ${active === cat.key ? "active" : ""}`}
                onClick={() => setActive(cat.key)}
                data-cat={cat.key}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="heroActions">
            <Link to="/write" className="heroBtn heroBtnPrimary">
              Start Writing
              <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/trending" className="heroBtn heroBtnOutline">
              <i className="fas fa-fire"></i>
              Trending
            </Link>
          </div>

          <div className="heroStats">
            {HERO_STATS.map((stat: { value: string; label: string }, i: number) => (
              <div key={stat.label} style={{ display: "contents" }}>
                {i > 0 && <div className="heroStatDivider"></div>}
                <div className="heroStat">
                  <span className="heroStatNum">{stat.value}</span>
                  <span className="heroStatLabel">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="heroTicker">
            <span className="heroTickerLabel">Powered by</span>
            <div className="heroTickerList">
              {HERO_TECH.map(
                (tech: string, i: number) => (
                  <span key={tech} className="heroTickerItem">
                    {tech}
                    {i < HERO_TECH.length - 1 && <span className="heroTickerDot">·</span>}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="heroRight">
          <div className="heroShowcase">
            <div className="heroShowcaseGlow"></div>

            <div className="heroShowcaseImg">
              <img
                src={HERO_IMAGE}
                alt="Travel adventure"
                loading="eager"
              />
              <div className="heroShowcaseBadge">
                <i className="fas fa-sparkles"></i>
                Featured
              </div>
            </div>

            <div className="heroShowcaseContent">
              <div className="heroShowcaseIcon">
                <i className={`fas ${
                  active === "travel" ? "fa-globe-americas" :
                  active === "food" ? "fa-utensils" :
                  "fa-code"
                }`}></i>
              </div>
              <h3>{current.label} Diaries</h3>
              <p>{current.desc}</p>

              <div className="heroShowcaseFooter">
                <span className="heroShowcaseTag">
                  <i className="fas fa-tag"></i>
                  {active}
                </span>
                <Link to={`/?cat=${active}`} className="heroShowcaseLink">
                  Explore <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
