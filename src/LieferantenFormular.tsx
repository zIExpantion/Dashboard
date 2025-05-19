import { useState } from "react";

interface NeuerLieferant {
  name: string;
  produkt: string;
  geodaten: string;
  land: string;
  kontinent: string;
  zertifikat: boolean;
}

interface Props {
  onAnlegen: (lieferant: NeuerLieferant) => void;
}

export default function LieferantenFormular({ onAnlegen }: Props) {
  const [form, setForm] = useState<NeuerLieferant>({
    name: "",
    produkt: "",
    geodaten: "",
    land: "",
    kontinent: "",
    zertifikat: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.produkt || !form.land || !form.kontinent) return;
    onAnlegen(form);
    setForm({ name: "", produkt: "", geodaten: "", land: "", kontinent: "", zertifikat: false });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4 mt-6">
      <h3 className="text-xl font-bold text-blue-700">➕ Lieferant anlegen</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="produkt"
          placeholder="Produkt"
          value={form.produkt}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="geodaten"
          placeholder="Geodaten (z. B. -10.333, -45.667)"
          value={form.geodaten}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="land"
          placeholder="Land"
          value={form.land}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="kontinent"
          placeholder="Kontinent"
          value={form.kontinent}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="zertifikat"
            checked={form.zertifikat}
            onChange={handleChange}
          />
          <span>Nachhaltigkeitszertifikat vorhanden</span>
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          💾 Anlegen
        </button>
      </form>
    </div>
  );
}