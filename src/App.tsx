import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import LieferantenFormular from "./LieferantenFormular";
import { useEffect } from "react";





interface RisikoEintrag {
  kriterium: string;
  punkte: number;
}
interface Bestellung {
  datum: string;
  menge: number;
  produkt: string;
  status: "abgeschlossen" | "offen" | "storniert";
}


interface Lieferant {
  name: string;
  produkt: string;
  risiko: number;
  geodaten: string;
  land: string;
  kontinent: string;
  zertifikat: boolean;
  benutzerRisiken?: RisikoEintrag[];
  bestellungen?: Bestellung[];
}

const vorgefertigteRisiken: RisikoEintrag[] = [
  { kriterium: "Keine Satellitendaten verfügbar", punkte: 15 },
  { kriterium: "Fehlende Lieferkettentransparenz", punkte: 20 },
  { kriterium: "Unbekannter Herkunftsnachweis", punkte: 25 },
];

const initialLieferanten: Lieferant[] = [
  { name: "KaffeeCo Brasilien", produkt: "Kaffee", risiko: 85, geodaten: "-10.333, -45.667", land: "Brasilien", kontinent: "Südamerika", zertifikat: false, benutzerRisiken: [],bestellungen: [
    { datum: "2025-01-10", menge: 1000, produkt: "Kaffee", status: "abgeschlossen" },
    { datum: "2025-03-05", menge: 800, produkt: "Kaffee", status: "offen" },
  ] },
  { name: "ChocoTrade Ghana", produkt: "Schokolade", risiko: 75, geodaten: "7.9465, -1.0232", land: "Ghana", kontinent: "Afrika", zertifikat: true, benutzerRisiken: [],bestellungen: [
    { datum: "2025-02-18", menge: 500, produkt: "Schokolade", status: "abgeschlossen" }
  ] },
  { name: "BeefExport Argentinien", produkt: "Rindfleisch", risiko: 92, geodaten: "-38.4161, -63.6167", land: "Argentinien", kontinent: "Südamerika", zertifikat: false, benutzerRisiken: [] },
  { name: "PapierMüller DE", produkt: "Papier", risiko: 20, geodaten: "51.1657, 10.4515", land: "Deutschland", kontinent: "Europa", zertifikat: true, benutzerRisiken: [] },
];

function berechneRisiko(lieferant: Lieferant) {
  let punkte = 0;
  const details: RisikoEintrag[] = [];

  const hochrisikoLaender = ["Brasilien", "Indonesien", "Argentinien", "Kongo"];
  const hochrisikoProdukte = ["Rindfleisch", "Kaffee", "Kakao", "Palmöl"];

  if (hochrisikoLaender.includes(lieferant.land)) {
    punkte += 40;
    details.push({ kriterium: "Herkunftsland ist Hochrisiko", punkte: 40 });
  }
  if (!lieferant.zertifikat) {
    punkte += 30;
    details.push({ kriterium: "Kein Nachhaltigkeitszertifikat vorhanden", punkte: 30 });
  }
  if (!lieferant.geodaten) {
    punkte += 20;
    details.push({ kriterium: "Geodaten fehlen", punkte: 20 });
  }
  if (hochrisikoProdukte.includes(lieferant.produkt)) {
    punkte += 10;
    details.push({ kriterium: "Produkt gehört zu Hochrisikokategorie", punkte: 10 });
  }
  if (lieferant.benutzerRisiken) {
    lieferant.benutzerRisiken.forEach((r) => {
      punkte += r.punkte;
      details.push(r);
    });
  }

  let stufe = "niedrig";
  if (punkte >= 60) stufe = "hoch";
  else if (punkte >= 30) stufe = "mittel";

  return { punkte, stufe, details };
}

export default function App() 
{
  const [tab, setTab] = useState<"uebersicht" | "produkte" | "risiken" | "lieferanten" | "lieferantAnlegen" | "lieferantDetails" | "bestellungAnlegen">("uebersicht");


  const [lieferantenListe, setLieferantenListe] = useState<Lieferant[]>(initialLieferanten);
  const [ausgewaehlterLieferant, setAusgewaehlterLieferant] = useState<Lieferant | null>(null);
  const [ausgewaehltesProdukt, setAusgewaehltesProdukt] = useState<string | null>(null);
  const [neuesRisiko, setNeuesRisiko] = useState<string>("");
  const [neuePunkte, setNeuePunkte] = useState<number>(0);

  const [eingeloggt, setEingeloggt] = useState(false);
  const [benutzername, setBenutzername] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [suchbegriff, setSuchbegriff] = useState("");
const [landFilter, setLandFilter] = useState("");
const [kontinentFilter, setKontinentFilter] = useState("");
const [zeigeFormular, setZeigeFormular] = useState(false);





  if (!eingeloggt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-blue-700">🔐 Login</h2>
          <input
            type="text"
            placeholder="Benutzername"
            value={benutzername}
            onChange={(e) => setBenutzername(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          {fehler && <p className="text-red-600 text-sm">{fehler}</p>}
          <button
            onClick={() => {
              if (benutzername === "admin" && passwort === "passwort123") {
                setEingeloggt(true);
                setFehler("");
              } else {
                setFehler("Benutzername oder Passwort ist falsch.");
              }
            }}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Einloggen
          </button>
          <p className="text-gray-500 text-sm text-center">Tipp: admin / passwort123</p>
        </div>
      </div>
    );
  }
  const handleVorgefertigtHinzufuegen = (eintrag: RisikoEintrag) => {
    if (!ausgewaehlterLieferant) return;
    const neueRisiken = [...(ausgewaehlterLieferant.benutzerRisiken || []), eintrag];
    const aktualisiert = { ...ausgewaehlterLieferant, benutzerRisiken: neueRisiken };
    setAusgewaehlterLieferant(aktualisiert);
    setLieferantenListe(prev => prev.map(l => l.name === aktualisiert.name ? aktualisiert : l));
  };

  const handleEigenesRisikoHinzufuegen = () => {
    if (!ausgewaehlterLieferant || !neuesRisiko || neuePunkte <= 0) return;
    const neues: RisikoEintrag = { kriterium: neuesRisiko, punkte: neuePunkte };
    const neueRisiken = [...(ausgewaehlterLieferant.benutzerRisiken || []), neues];
    const aktualisiert = { ...ausgewaehlterLieferant, benutzerRisiken: neueRisiken };
    setAusgewaehlterLieferant(aktualisiert);
    setLieferantenListe(prev => prev.map(l => l.name === aktualisiert.name ? aktualisiert : l));
    setNeuesRisiko("");
    setNeuePunkte(0);
  };

  const handleRisikoLoeschen = (index: number) => {
    if (!ausgewaehlterLieferant || !ausgewaehlterLieferant.benutzerRisiken) return;
    const neueRisiken = [...ausgewaehlterLieferant.benutzerRisiken];
    neueRisiken.splice(index, 1);
    const aktualisiert = { ...ausgewaehlterLieferant, benutzerRisiken: neueRisiken };
    setAusgewaehlterLieferant(aktualisiert);
    setLieferantenListe(prev => prev.map(l => l.name === aktualisiert.name ? aktualisiert : l));
  };

  function exportiereLieferantenAlsCSV(lieferanten: Lieferant[]) {
    const headers = ["Name", "Produkt", "Geodaten", "Land", "Kontinent", "Zertifikat"];
    const rows = lieferanten.map(l =>
      [l.name, l.produkt, l.geodaten, l.land, l.kontinent, l.zertifikat ? "Ja" : "Nein"].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lieferanten.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  

  return (
    
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
  <div className="text-blue-700 font-semibold text-lg">
    👋 Hallo {benutzername}
  </div>
  <button
    onClick={() => {
      setEingeloggt(false);
      setBenutzername("");
      setPasswort("");
      setFehler("");
    }}
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
  >
    🚪 Logout
  </button>

  
</div>
      <h1 className="text-3xl font-bold text-blue-700">🌱 EUDR Dashboard – Handelshaus GmbH</h1>

      {!ausgewaehlterLieferant && (
  <div className="flex space-x-4">
    <button onClick={() => setTab("uebersicht")} className={`px-4 py-2 rounded ${tab === "uebersicht" ? "bg-blue-600 text-white" : "bg-white border"}`}>Übersicht</button>
    <button onClick={() => setTab("produkte")} className={`px-4 py-2 rounded ${tab === "produkte" ? "bg-blue-600 text-white" : "bg-white border"}`}>Produkte</button>
    <button onClick={() => setTab("risiken")} className={`px-4 py-2 rounded ${tab === "risiken" ? "bg-blue-600 text-white" : "bg-white border"}`}>Risiken</button>
    <button onClick={() => setTab("lieferanten")} className={`px-4 py-2 rounded ${tab === "lieferanten" ? "bg-blue-600 text-white" : "bg-white border"}`}>Lieferanten</button>
    <button onClick={() => setTab("bestellungAnlegen")} className={`px-4 py-2 rounded ${tab === "bestellungAnlegen" ? "bg-blue-600 text-white" : "bg-white border"}`}>Bestellung Anfragen</button>
  </div>
)}


      {tab === "uebersicht" && (
        <div className="bg-white p-6 rounded-xl shadow space-y-6 border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold text-blue-800">📋 Konto Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
  <div className="space-y-4">
    <div>
      <p className="text-lg text-gray-500">👤 Benutzer</p>
      <p className="text-2xl font-bold text-blue-700">GreenChain</p>
    </div>
    <div>
      <p className="text-lg text-gray-500">📅 Letztes Update</p>
      <p className="text-2xl font-bold text-blue-700">08. April 2025</p>
    </div>
  </div>

  <div className="space-y-4">
    <div>
      <p className="text-lg text-gray-500">🏢 Unternehmen</p>
      <p className="text-2xl font-bold text-blue-700">Handelshaus GmbH</p>
    </div>
    <div>
      <p className="text-lg text-gray-500">📁 Projektstatus</p>
      <p className="text-2xl font-bold text-blue-700">In Bearbeitung</p>
    </div>
  </div>
</div>

          <div>
            <h3 className="text-xl font-semibold mb-4">🌍 Verteilung nach Kontinent</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={
                Object.entries(
                  lieferantenListe.reduce((acc, l) => {
                    acc[l.kontinent] = (acc[l.kontinent] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([kontinent, anzahl]) => ({ kontinent, anzahl }))
              }>
                <XAxis dataKey="kontinent" />
                <YAxis domain={[0, 5]} tickCount={11} />

                <Tooltip />
                <Bar dataKey="anzahl" fill="#4299e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-xl font-semibold mb-2">📂 Regulierungen (Platzhalter)</h3>
            <ul className="list-disc ml-6 text-blue-600">
              <li><a href="#">Lieferantendaten_EUDR_2025.xlsx</a></li>
              <li><a href="#">Risikoanalyse_Report_Q1.pdf</a></li>
              <li><a href="#">Compliance_Checkliste_EUDR.docx</a></li>
            </ul>
          </div>
        </div>
      )}
     

{tab === "risiken" && (
  <div className="bg-white p-6 rounded-xl shadow space-y-8 border-t-4 border-red-500">
    <h2 className="text-2xl font-bold text-red-600">🛡️ EUDR Risiko Cockpit</h2>

    {/* Bereich 1: Kritische Risikoarten (Platzhalter) */}
    <div>
      <h3 className="text-xl font-semibold mb-2">🔥 Kritische Risikoarten (nach EUDR)</h3>
      <ul className="list-disc ml-6 text-gray-800">
        <li><strong>Entwaldungspotenzial</strong> – z. B. bei Kaffee, Kakao, Palmöl</li>
        <li><strong>Fehlende Herkunftsangabe</strong> – keine Geodaten oder Nachweise</li>
        <li><strong>Unzertifizierte Lieferanten</strong> – ohne Nachhaltigkeitslabel</li>
        <li><strong>Lieferkettentransparenz</strong> – keine Chain-of-Custody-Daten</li>
        <li><strong>Satellitendaten unklar</strong> – kein Abgleich mit Entwaldung möglich</li>
      </ul>
    </div>

    {/* Bereich 2: Häufigste Benutzerdefinierte Risiken */}
    <div>
      <h3 className="text-xl font-semibold mb-2">📊 Top 5 Benutzerdefinierte Risiken</h3>
      <ul className="list-decimal ml-6 text-gray-800">
        {Object.entries(
          lieferantenListe.flatMap(l => l.benutzerRisiken || []).reduce((acc, r) => {
            acc[r.kriterium] = (acc[r.kriterium] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([kriterium, anzahl], i) => (
          <li key={i}>
            <strong>{kriterium}</strong> – {anzahl}× erwähnt
          </li>
        ))}
        {lieferantenListe.every(l => (l.benutzerRisiken?.length || 0) === 0) && (
          <li className="text-gray-500 italic">Noch keine benutzerdefinierten Risiken erfasst</li>
        )}
      </ul>
    </div>

    {/* Bereich 3: Lieferanten mit hohem Risiko */}
    <div>
      <h3 className="text-xl font-semibold mb-2">🚩 Lieferanten mit hohem Risiko</h3>
      <ul className="list-disc ml-6 text-red-700 font-medium">
        {lieferantenListe
          .filter(l => berechneRisiko(l).stufe === "hoch")
          .map((l, i) => (
            <li key={i}>
              {l.name} ({l.produkt} – {l.land}) – {berechneRisiko(l).punkte} Punkte
            </li>
          ))}
        {lieferantenListe.filter(l => berechneRisiko(l).stufe === "hoch").length === 0 && (
          <li className="text-green-600">✅ Kein Lieferant aktuell in der Hochrisiko-Stufe</li>
        )}
      </ul>
    </div>

    {/* Bereich 4: Handlungsbedarf – Noch unbewertete */}
    <div>
      <h3 className="text-xl font-semibold mb-2">🕵️‍♂️ Lieferanten ohne individuelle Bewertung</h3>
      <ul className="list-disc ml-6 text-gray-800">
        {lieferantenListe
          .filter(l => (l.benutzerRisiken?.length || 0) === 0)
          .map((l, i) => (
            <li key={i}>{l.name} ({l.produkt}, {l.land})</li>
          ))}
        {lieferantenListe.filter(l => (l.benutzerRisiken?.length || 0) === 0).length === 0 && (
          <li className="text-green-600">✅ Alle Lieferanten wurden bereits bewertet</li>
        )}
      </ul>
    </div>

    {/* Bereich 5: Hinweis & Export */}
    <div className="pt-4 border-t">
      <p className="text-gray-500 text-sm italic">
        Für Ihre EUDR-Dokumentation können Sie diese Analyse exportieren.
      </p>
      <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded shadow">📥 Risikoübersicht exportieren</button>
    </div>
  </div>
)}

     {tab === "produkte" && (
  <>
    {!ausgewaehltesProdukt ? (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">📦 Produktübersicht</h2>
        {Array.from(new Set(lieferantenListe.map(l => l.produkt))).map((produkt, index) => (
          <div
            key={index}
            onClick={() => setAusgewaehltesProdukt(produkt)}
            className="bg-white p-4 rounded-xl shadow hover:bg-blue-50 cursor-pointer transition-all"
          >
            <div className="text-3xl mb-2">
              {produkt === "Kaffee" && "☕️"}
              {produkt === "Schokolade" && "🍫"}
              {produkt === "Rindfleisch" && "🥩"}
              {produkt === "Papier" && "📄"}
              {!["Kaffee", "Schokolade", "Rindfleisch", "Papier"].includes(produkt) && "📦"}
            </div>
            <h3 className="text-xl font-semibold text-blue-700">{produkt}</h3>
            <p className="text-gray-600 text-sm">
              {lieferantenListe.filter(l => l.produkt === produkt).length} Lieferant(en)
            </p>
          </div>
        ))}

        
      </div>
    ) : (
      <div className="bg-white p-6 rounded-xl shadow space-y-6 border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold text-blue-800">🔍 Lieferanten für {ausgewaehltesProdukt}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lieferantenListe
            .filter(l => l.produkt === ausgewaehltesProdukt)
            .map((l, i) => {
              const risiko = berechneRisiko(l);
              return (
                <div key={i} className="p-4 border rounded shadow-sm bg-gray-50">
                  <h3 className="text-lg font-semibold">{l.name}</h3>
                  <p>🌍 Land: {l.land}</p>
                  <p>🌐 Kontinent: {l.kontinent}</p>
                  <p>📍 Geodaten: {l.geodaten}</p>
                  <p>✅ Zertifikat: {l.zertifikat ? "Ja" : "Nein"}</p>
                  <p className={`font-bold mt-2 ${risiko.stufe === "hoch" ? "text-red-600" : risiko.stufe === "mittel" ? "text-yellow-600" : "text-green-600"}`}>
                    {risiko.stufe.toUpperCase()} ({risiko.punkte} Punkte)
                  </p>
                </div>
              );
            })}
        </div>

        <button
          onClick={() => setAusgewaehltesProdukt(null)}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
        >
          🔙 Zurück zur Produktübersicht
        </button>
      </div>
    )}
  </>
)}

{tab === "lieferantAnlegen" && (
  <div className="bg-white p-6 rounded-xl shadow space-y-4 border-t-4 border-blue-600">
    <h2 className="text-2xl font-bold text-blue-700">📝 Neuen Lieferant anlegen</h2>

    <LieferantenFormular
      onAnlegen={(neuerLieferant) => {
        const risikoDaten = berechneRisiko({
          ...neuerLieferant,
          risiko: 0,
          benutzerRisiken: [],
        });

        setLieferantenListe(prev => [
          ...prev,
          {
            ...neuerLieferant,
            risiko: risikoDaten.punkte,
            benutzerRisiken: [],
          },
        ]);

        setTab("lieferanten"); // Zurück zur Übersicht nach dem Anlegen
      }}
    />

    <button
      onClick={() => setTab("lieferanten")}
      className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
    >
      🔙 Zurück zur Lieferantenübersicht
    </button>
  </div>
)}


{tab === "lieferanten" && (
  <div className="bg-white p-6 rounded-xl shadow space-y-4 border-t-4 border-blue-600">
    <h2 className="text-2xl font-bold text-blue-700">📋 Lieferantenübersicht</h2>

    {zeigeFormular && (
  <LieferantenFormular
    onAnlegen={(neuerLieferant) => {
      const risikoDaten = berechneRisiko({
        ...neuerLieferant,
        risiko: 0,
        benutzerRisiken: [],
      });

      setLieferantenListe(prev => [
        ...prev,
        {
          ...neuerLieferant,
          risiko: risikoDaten.punkte,
          benutzerRisiken: [],
        },
      ]);

      setZeigeFormular(false); // Nach dem Anlegen schließen
    }}
  />
)}




<button
  onClick={() => setTab("lieferantAnlegen")}
  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
>
  ➕ Lieferant anlegen
</button>






    <div className="flex justify-end">
      <button
        onClick={() => exportiereLieferantenAlsCSV(lieferantenListe)}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
      >
        ⬇️ CSV exportieren
      </button>
    </div>

    <table className="w-full text-left border mt-6">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">Name</th>
          <th className="p-2">Produkt</th>
          <th className="p-2">Land</th>
          <th className="p-2">Kontinent</th>
          <th className="p-2">Risiko</th>
        </tr>
      </thead>
      <tbody>
        {lieferantenListe.map((l, i) => {
          const r = berechneRisiko(l);
          return (
            <tr
  key={i}
  onClick={() => {
    setAusgewaehlterLieferant(l);
    setTab("lieferantDetails");
  }}
  className="border-t cursor-pointer hover:bg-gray-50"
>

              <td className="p-2 font-medium">{l.name}</td>
              <td className="p-2">{l.produkt}</td>
              <td className="p-2">{l.land}</td>
              <td className="p-2">{l.kontinent}</td>
              <td className={`p-2 font-semibold ${r.stufe === "hoch" ? "text-red-600" : r.stufe === "mittel" ? "text-yellow-600" : "text-green-600"}`}>
                {r.stufe.toUpperCase()} ({r.punkte})
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}
{tab === "bestellungAnlegen" && (
  <div className="bg-white p-6 rounded-xl shadow space-y-6 border-t-4 border-blue-600">
    <h2 className="text-2xl font-bold text-blue-700">📦 Bestellung Anfragen</h2>

    {/* Dropdown + Eingabefelder */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lieferant auswählen</label>
        <div className="relative">
          <select
            onChange={(e) => setAusgewaehlterLieferant(
              lieferantenListe.find(l => l.name === e.target.value) || null
            )}
            className="appearance-none w-full bg-white border border-gray-300 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Bitte wählen --</option>
            {lieferantenListe.map((l, i) => (
              <option key={i} value={l.name}>{l.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548a.75.75 0 011.06 0L10 10.972l3.424-3.424a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"/></svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bestellnummer</label>
        <input type="text" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="z. B. ORD-2025-001" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Kategorie</label>
        <input type="text" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="z. B. Express / Normal" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Menge</label>
        <input type="number" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="z. B. 500" />
      </div>
    </div>

    {/* Buttons */}
    <button
      onClick={() => {
        if (!ausgewaehlterLieferant) return alert("Bitte Lieferant auswählen.");
        const risiko = berechneRisiko(ausgewaehlterLieferant);
        if (risiko.stufe === "hoch") {
          alert("❌ DDS-Prüfung fehlgeschlagen! Bestellung abgebrochen. Lieferant wird benachrichtigt.");
        } else {
          alert("✅ DDS erfolgreich. Bestellung aufgenommen. Lieferschein & Zollinformationen folgen.");
        }
      }}
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
    >
      🚀 Bestellung anfragen
    </button>

    <div className="flex gap-4 mt-6">
      <button
        onClick={() => {
          const pdfContent = `Bestellung erfolgreich generiert\n\nLieferant: ${ausgewaehlterLieferant?.name || "Unbekannt"}\nProdukt: ${ausgewaehlterLieferant?.produkt || "-"}\nStatus: DDS erfolgreich – Lieferschein liegt bei`;
          const blob = new Blob([pdfContent], { type: "application/pdf" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "lieferschein_simuliert.pdf";
          link.click();
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
      >
        📄 Lieferschein simulieren (PDF)
      </button>
    </div>
  </div>
)}





{tab === "lieferantDetails" && ausgewaehlterLieferant && (
  <div className="bg-white p-6 rounded-xl shadow space-y-6 border-t-4 border-blue-600">
    <h2 className="text-2xl font-bold text-blue-800">🔍 Risikoanalyse für {ausgewaehlterLieferant.name}</h2>

    <div className="grid grid-cols-2 gap-4 text-gray-700">
      <p><strong>📦 Produkt:</strong> {ausgewaehlterLieferant.produkt}</p>
      <p><strong>🌍 Land:</strong> {ausgewaehlterLieferant.land}</p>
      <p><strong>🌐 Kontinent:</strong> {ausgewaehlterLieferant.kontinent}</p>
      <p><strong>📍 Geodaten:</strong> {ausgewaehlterLieferant.geodaten || "Nicht vorhanden"}</p>
      <p><strong>✅ Zertifikat:</strong> {ausgewaehlterLieferant.zertifikat ? "Ja" : "Nein"}</p>
    </div>
    

    {(() => {
      const ergebnis = berechneRisiko(ausgewaehlterLieferant);
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">📊 Risikobewertung</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Punkte:</span>
            <span className="text-2xl font-bold">{ergebnis.punkte}</span>
            <span className={`px-3 py-1 rounded-full text-white text-sm ${
              ergebnis.stufe === "hoch" ? "bg-red-600" :
              ergebnis.stufe === "mittel" ? "bg-yellow-500" :
              "bg-green-600"
            }`}>
              {ergebnis.stufe.toUpperCase()}
            </span>
          </div>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            {ergebnis.details.map((item, idx) => (
              <li key={idx}><strong>+{item.punkte}</strong> {item.kriterium}</li>
            ))}
          </ul>
        </div>
      );
    })()}
        <div>
      <h3 className="text-xl font-semibold mt-6">📦 Bestellhistorie</h3>
      {ausgewaehlterLieferant.bestellungen && ausgewaehlterLieferant.bestellungen.length > 0 ? (
        <table className="w-full text-left border mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Datum</th>
              <th className="p-2">Produkt</th>
              <th className="p-2">Menge</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ausgewaehlterLieferant.bestellungen.map((b, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{b.datum}</td>
                <td className="p-2">{b.produkt}</td>
                <td className="p-2">{b.menge}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white text-sm ${
                    b.status === "abgeschlossen" ? "bg-green-600" :
                    b.status === "offen" ? "bg-yellow-500" :
                    "bg-red-600"
                  }`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 italic">Keine Bestellungen vorhanden.</p>
      )}
    </div>


    <h3 className="text-lg font-semibold mt-6">Neue Risiken</h3>
    <ul className="list-disc ml-6">
      {ausgewaehlterLieferant.benutzerRisiken?.map((r, i) => (
        <li key={i}>
          {r.kriterium} (+{r.punkte})
          <button className="text-red-600 ml-2" onClick={() => handleRisikoLoeschen(i)}>Löschen</button>
        </li>
      ))}
    </ul>

    <div className="mt-4">
      <input
        type="text"
        placeholder="Neues Risiko"
        value={neuesRisiko}
        onChange={(e) => setNeuesRisiko(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        type="number"
        placeholder="Punkte"
        value={neuePunkte}
        onChange={(e) => setNeuePunkte(Number(e.target.value))}
        className="border p-2 mr-2 w-24"
      />
      <button
        onClick={handleEigenesRisikoHinzufuegen}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Hinzufügen
      </button>
    </div>

    <div className="mt-4">
      <h3 className="font-semibold">Vorgefertigte Risiken:</h3>
      {vorgefertigteRisiken.map((r, i) => (
        <button
          key={i}
          onClick={() => handleVorgefertigtHinzufuegen(r)}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded m-1 text-sm"
        >
          {r.kriterium} (+{r.punkte})
        </button>
      ))}
    </div>

    <button
  onClick={() => {
    setTab("lieferanten");
    setTimeout(() => setAusgewaehlterLieferant(null), 0);
  }}
  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow"
>
  🔙 Zurück zur Übersicht
</button>


  </div>
)}


    </div>
  );
}
