export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Bienvenue sur le Dashboard Admin</h1>
      <p className="text-slate-600 text-lg">
        Accédez à toutes les fonctionnalités de gestion via le menu latéral.
      </p>
      {/* Tu pourras ajouter ici des stats rapides, des accès rapides, etc. */}
    </div>
  );
}