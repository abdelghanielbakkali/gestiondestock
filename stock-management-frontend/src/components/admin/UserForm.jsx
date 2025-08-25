import { useState } from "react";

export default function UserForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(
    initial || {
      prenom: "",
      nom: "",
      email: "",
      password: "",
      role: "gestionnaire",
      telephone: "",
      adresse: "",
      photo: null,
    }
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          name="prenom"
          placeholder="Prénom"
          className="w-full border rounded px-3 py-2"
          value={form.prenom}
          onChange={handleChange}
          required
        />
        <input
          name="nom"
          placeholder="Nom"
          className="w-full border rounded px-3 py-2"
          value={form.nom}
          onChange={handleChange}
          required
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border rounded px-3 py-2"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        className="w-full border rounded px-3 py-2"
        value={form.password}
        onChange={handleChange}
        required={!initial}
      />
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      >
        <option value="admin">Admin</option>
        <option value="gestionnaire">Gestionnaire</option>
        <option value="fournisseur">Fournisseur</option>
      </select>
      <input
        name="telephone"
        placeholder="Téléphone"
        className="w-full border rounded px-3 py-2"
        value={form.telephone}
        onChange={handleChange}
      />
      <input
        name="adresse"
        placeholder="Adresse"
        className="w-full border rounded px-3 py-2"
        value={form.adresse}
        onChange={handleChange}
      />
      <input
        name="photo"
        type="file"
        accept="image/*"
        className="w-full border rounded px-3 py-2"
        onChange={handleChange}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 font-semibold"
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}