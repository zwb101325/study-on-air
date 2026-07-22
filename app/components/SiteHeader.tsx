type FocusPage = "flight" | "cafe" | "live" | "classroom";

const navigation: Array<{ id: FocusPage; label: string; href: string }> = [
  { id: "flight", label: "专注航班", href: "/focus-flight" },
  { id: "cafe", label: "专注咖啡馆", href: "/focus-cafe" },
  { id: "live", label: "专注直播间", href: "/focus-live" },
  { id: "classroom", label: "专注课堂", href: "/focus-classroom" },
];

export default function SiteHeader({ active }: { active?: FocusPage }) {
  return (
    <header className="topbar site-header">
      <a className="brand" href="/" aria-label="返回晚风专注空间首页">
        <span className="brand-mark">W</span>
        <span>
          <strong>晚风 FOCUS</strong>
          <small>找到你的专注节奏</small>
        </span>
      </a>

      <nav className="focus-navigation" aria-label="专注场景导航">
        {navigation.map((item) => (
          <a
            className={active === item.id ? "focus-nav-link active" : "focus-nav-link"}
            href={item.href}
            key={item.id}
            aria-current={active === item.id ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a className="profile-button header-profile" href="/" aria-label="返回首页">晚</a>
    </header>
  );
}
