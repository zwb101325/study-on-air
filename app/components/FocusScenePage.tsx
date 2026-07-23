import SiteHeader from "./SiteHeader";
import { withBasePath } from "../base-path";

type ScenePageProps = {
  active: "flight" | "cafe" | "classroom";
  theme: string;
  kicker: string;
  title: string;
  description: string;
  icon: string;
  session: string;
  details: Array<{ label: string; value: string }>;
};

export default function FocusScenePage({ active, theme, kicker, title, description, icon, session, details }: ScenePageProps) {
  return (
    <main className={`page-shell scene-page scene-${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader active={active} />

      <section className="scene-shell">
        <div className="scene-copy">
          <span className="scene-kicker">{kicker}</span>
          <span className="scene-large-icon" aria-hidden="true">{icon}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="scene-actions">
            <a className="hero-primary" href={withBasePath("/focus-live")}>去直播间共同专注 <span>→</span></a>
            <a className="hero-secondary" href={withBasePath("/")}>返回首页</a>
          </div>
        </div>

        <div className="session-card">
          <header><span><i /> READY</span><b>{session}</b></header>
          <div className="session-clock"><small>本轮专注</small><strong>25:00</strong><span>准备开始</span></div>
          <div className="session-progress"><i /></div>
          <div className="session-details">
            {details.map((detail) => (
              <span key={detail.label}><small>{detail.label}</small><strong>{detail.value}</strong></span>
            ))}
          </div>
          <footer><span>把手机放远一点</span><span>一次只做一件事</span></footer>
        </div>
      </section>
    </main>
  );
}
