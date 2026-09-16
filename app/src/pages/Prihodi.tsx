import { KlasifikacijaPage } from "./KlasifikacijaPage";

export function Prihodi() {
  return (
    <KlasifikacijaPage
      dataPath="ekonomska.json"
      title="Prihodi i rashodi prema ekonomskoj klasifikaciji"
      description="Opći dio izvještaja — svi prihodi, primici, rashodi i izdaci razvrstani prema ekonomskoj klasifikaciji (kontni plan), s planom i izvršenjem za 2025. godinu."
      topLevel={1}
      narrativeSectionKeys={["prihodi", "rashodi-uprava", "rashodi-korisnici"]}
      exportName="prihodi-rashodi-ekonomska"
    />
  );
}
