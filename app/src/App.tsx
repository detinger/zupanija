import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/Skeleton";
import { Naslovnica } from "./pages/Naslovnica";
const Prihodi = lazy(()=>import("./pages/Prihodi").then(m=>({default:m.Prihodi})));
const Rashodi = lazy(()=>import("./pages/Rashodi").then(m=>({default:m.Rashodi})));
const Organizacijska = lazy(()=>import("./pages/Organizacijska").then(m=>({default:m.Organizacijska})));
const Programska = lazy(()=>import("./pages/Programska").then(m=>({default:m.Programska})));
const Financiranje = lazy(()=>import("./pages/Financiranje").then(m=>({default:m.Financiranje})));
const Investicije = lazy(()=>import("./pages/Investicije").then(m=>({default:m.Investicije})));
const Pretraga = lazy(()=>import("./pages/Pretraga").then(m=>({default:m.Pretraga})));
const Preuzimanja = lazy(()=>import("./pages/Preuzimanja").then(m=>({default:m.Preuzimanja})));
export default function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL}><ErrorBoundary><Suspense fallback={<PageSkeleton/>}><Routes><Route element={<Layout/>}>
    <Route index element={<Naslovnica/>}/><Route path="prihodi" element={<Prihodi/>}/><Route path="rashodi" element={<Rashodi/>}/><Route path="organizacijska" element={<Organizacijska/>}/><Route path="programska" element={<Programska/>}/><Route path="financiranje" element={<Financiranje/>}/><Route path="investicije" element={<Investicije/>}/><Route path="pretraga" element={<Pretraga/>}/><Route path="preuzimanja" element={<Preuzimanja/>}/>
    <Route path="*" element={<section className="dashboard-panel"><h1>Stranica nije pronađena</h1><p className="my-4">Otvorite pregled proračuna i nastavite istraživati.</p><Link to="/" className="primary-link">Pregled proračuna</Link></section>}/>
  </Route></Routes></Suspense></ErrorBoundary></BrowserRouter>;
}
