import { NavLink, Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, Landmark, PieChart, Building2, GitBranch, Wallet, HardHat, Search, Download, Menu, X, ArrowUpRight } from "lucide-react";
import { Grb } from "./Logo";
const NAV = [
  { to: "/", label: "Pregled proračuna", end: true, icon: LayoutDashboard },
  { to: "/rashodi", label: "Kamo odlazi novac", icon: PieChart },
  { to: "/prihodi", label: "Prihodi i rashodi", icon: Landmark },
  { to: "/organizacijska", label: "Upravna tijela", icon: Building2 },
  { to: "/programska", label: "Programi i projekti", icon: GitBranch },
  { to: "/financiranje", label: "Financiranje", icon: Wallet },
  { to: "/investicije", label: "Investicije", icon: HardHat },
  { to: "/pretraga", label: "Pretraživanje", icon: Search },
  { to: "/preuzimanja", label: "Izvorni dokumenti", icon: Download },
];
export function Layout() {
  const [openAt, setOpenAt] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const open = openAt === location.key;
  useEffect(() => {
    document.title = `${NAV.find(n => n.to === location.pathname)?.label ?? "Proračun"} · Istra 2025.`;
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    function close(e: KeyboardEvent) { if (e.key === "Escape") setOpenAt(null); }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Preskoči na sadržaj</a>
    <aside className="app-sidebar" data-open={open}>
      <Link className="app-brand" to="/" onClick={() => setOpenAt(null)}><Grb className="h-12 w-auto" /><span><strong>Istarska županija</strong><small>Regione Istriana</small></span></Link>
      <div className="app-sidebar-label">PRORAČUN 2025.</div>
      <nav id="primary-navigation" aria-label="Glavna navigacija">{NAV.map((item, i) => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpenAt(null)} className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""} ${i === 7 ? "app-nav-divider" : ""}`}><item.icon size={19} strokeWidth={1.7} /><span>{item.label}</span></NavLink>)}</nav>
      <div className="app-sidebar-bottom"><span>Javni podaci. Jasniji uvid.</span><p>Godišnji izvještaj o izvršenju proračuna.</p><Link to="/preuzimanja">O izvoru podataka <ArrowUpRight size={14} /></Link></div>
    </aside>
    {open && <button className="app-backdrop" aria-label="Zatvori izbornik" onClick={() => setOpenAt(null)} />}
    <div className="app-body"><header className="app-topbar">
      <button className="app-menu" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Zatvori izbornik" : "Otvori izbornik"} onClick={() => setOpenAt(open ? null : location.key)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      <div className="app-breadcrumb">Istra <span>/</span> <strong>{NAV.find(n => n.to === location.pathname)?.label ?? "Proračun"}</strong></div>
      <form className="app-global-search" role="search" onSubmit={e => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); navigate(`/pretraga?q=${encodeURIComponent(String(q ?? ""))}`); }}><Search size={17} /><input name="q" aria-label="Pretraži izvještaj" placeholder="Pretraži izvještaj…" /><button type="submit" aria-label="Pokreni pretragu"><ArrowUpRight size={16} /></button></form>
      <span className="app-year">2025.</span>
    </header><main id="main-content" className="app-main"><Outlet /></main><footer className="app-footer"><span>Istarska županija · Proračun 2025.</span><span>Prikaz javnih podataka · Nije službena stranica Županije</span></footer></div>
  </div>;
}
