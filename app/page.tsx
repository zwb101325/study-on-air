import SiteHeader from "./components/SiteHeader";

const focusSpaces = [
  {
    href: "/focus-flight",
    icon: "✈",
    className: "flight",
    eyebrow: "登机即专注",
    title: "专注航班",
    description: "把待办变成目的地，在平稳航程中完成一段不被打扰的工作。",
    meta: "适合深度工作 · 45–90 分钟",
  },
  {
    href: "/focus-cafe",
    icon: "☕",
    className: "cafe",
    eyebrow: "一杯咖啡的时间",
    title: "专注咖啡馆",
    description: "柔和灯光与轻松氛围，陪你阅读、写作，或者安静整理思绪。",
    meta: "适合阅读写作 · 25–50 分钟",
  },
  {
    href: "/focus-live",
    icon: "◉",
    className: "live",
    eyebrow: "和大家一起在线",
    title: "专注直播间",
    description: "开启电脑摄像头，把实时画面变成直播源，与聊天室共同专注。",
    meta: "实时摄像头 · 弹幕与礼物互动",
  },
  {
    href: "/focus-classroom",
    icon: "✎",
    className: "classroom",
    eyebrow: "回到认真学习的课桌",
    title: "专注课堂",
    description: "清晰的学习节奏和课堂感布局，帮助你快速进入沉浸状态。",
    meta: "适合课程学习 · 40–60 分钟",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell home-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader />

      <section className="home-hero">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> 晚风专注空间</span>
          <h1>给每一次专注，<br /><em>一个恰好的场景。</em></h1>
          <p>从云端航班到温暖咖啡馆，从实时直播到安静课堂。选择今天的氛围，让开始变得简单。</p>
          <div className="hero-actions">
            <a className="hero-primary" href="/focus-live">进入专注直播间 <span>→</span></a>
            <a className="hero-secondary" href="#focus-spaces">浏览全部场景</a>
          </div>
          <div className="hero-stats" aria-label="网站特点">
            <span><strong>4</strong><small>种专注场景</small></span>
            <span><strong>LIVE</strong><small>实时摄像头</small></span>
            <span><strong>0</strong><small>开始门槛</small></span>
          </div>
        </div>

        <div className="hero-visual" aria-label="专注直播间预览">
          <div className="visual-window">
            <div className="visual-top"><span><i /> LIVE</span><b>晚风的专注时刻</b><small>42:18</small></div>
            <div className="visual-scene">
              <span className="visual-moon" />
              <span className="visual-desk" />
              <span className="visual-lamp" />
              <span className="visual-person" />
              <p className="visual-comment comment-one">今晚一起完成计划 ✦</p>
              <p className="visual-comment comment-two">画面很有氛围感</p>
              <p className="visual-comment comment-three">专注打卡 40 min</p>
            </div>
            <div className="visual-bottom"><span>Ⅱ</span><span>↻</span><b>00:42:18</b><i /><i /><i /></div>
          </div>
          <div className="floating-note note-one"><span>☕</span><b>今日专注</b><strong>2h 35m</strong></div>
          <div className="floating-note note-two"><span>✦</span><b>正在陪伴</b><strong>1,284 人</strong></div>
        </div>
      </section>

      <section className="focus-spaces" id="focus-spaces">
        <div className="section-heading">
          <div><span>CHOOSE YOUR SPACE</span><h2>今天，想在哪里专注？</h2></div>
          <p>每个空间都有不同的节奏，但目标相同：陪你把眼前的事情做好。</p>
        </div>
        <div className="space-grid">
          {focusSpaces.map((space, index) => (
            <a className={`space-card ${space.className}`} href={space.href} key={space.href}>
              <span className="space-number">0{index + 1}</span>
              <span className="space-icon">{space.icon}</span>
              <small>{space.eyebrow}</small>
              <h3>{space.title}</h3>
              <p>{space.description}</p>
              <footer><span>{space.meta}</span><b>进入场景 →</b></footer>
            </a>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <span className="brand-mark">W</span>
        <p><strong>晚风 FOCUS</strong><small>愿你在自己的节奏里，完成今天想做的事。</small></p>
        <a href="/focus-live">现在开始 →</a>
      </footer>
    </main>
  );
}
