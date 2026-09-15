import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
export class ErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() {
    if (this.state.failed) return <div className="dashboard-panel m-6" role="alert"><h1>Prikaz se nije mogao učitati</h1><p className="my-4 text-slate-600">Provjerite vezu i pokušajte ponovno. Vaš odabir je sačuvan u adresi stranice.</p><button className="primary-link" onClick={()=>window.location.reload()}><RefreshCw size={16}/> Pokušaj ponovno</button></div>;
    return this.props.children;
  }
}
