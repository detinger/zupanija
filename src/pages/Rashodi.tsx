import { KlasifikacijaPage } from "./KlasifikacijaPage";
import { BudgetExplorer } from "../components/BudgetExplorer";

export function Rashodi() {
  return (
    <div>
      <BudgetExplorer />
      <details className="be-raw-data">
        <summary>Svi rashodi — tablični podaci i usporedni graf</summary>
        <KlasifikacijaPage
          dataPath="funkcijska.json"
          title="Rashodi prema funkcijskoj klasifikaciji"
          description="Rashodi razvrstani prema funkciji na koju se odnose (opće javne usluge, obrazovanje, zdravstvo, socijalna skrb, kultura, promet i dr.), neovisno o tome koje ih upravno tijelo izvršava."
          topLevel={2}
          exportName="rashodi-funkcijska"
        />
      </details>
    </div>
  );
}
