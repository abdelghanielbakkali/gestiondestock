import Navbar from "../components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen text-[#0f172a] bg-gradient-to-b from-white via-blue-50 to-blue-100 scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      <section
        id="about"
        className="flex flex-col-reverse md:flex-row items-center justify-between px-6 py-24 max-w-6xl mx-auto"
      >
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-blue-800">
            Gérez vos stocks <span className="text-blue-500">intelligemment</span>
          </h1>
          <p className="mb-8 text-lg text-slate-600">
            Simplifiez la gestion de vos inventaires, automatisez les commandes et recevez des alertes en temps réel avec une interface moderne et sécurisée.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full shadow-md transition-all"
          >
            <Link to="/auth">Commencer</Link>
          </Button>
        </motion.div>

        <motion.img
          src="/stock-management.jpeg"
          alt="Gestion de stock"
          className="md:w-1/2 rounded-3xl shadow-xl mb-8 md:mb-0"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        />
      </section>

      {/* Services Section */}
      <section id="services" className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-blue-700">
          Nos Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl shadow-lg border border-blue-100 bg-white hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Gestion des Produits</h3>
                <p className="text-slate-600">Ajoutez, modifiez, supprimez et catégorisez vos produits facilement.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-2xl shadow-lg border border-blue-100 bg-white hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Gestion des Commandes</h3>
                <p className="text-slate-600">Créez, suivez et recevez des notifications sur vos commandes.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl shadow-lg border border-blue-100 bg-white hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Gestion des Fournisseurs</h3>
                <p className="text-slate-600">Centralisez les informations et suivez les livraisons de vos fournisseurs.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-16 mt-20 border-t border-blue-100"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">Restons en contact</h3>
          <p className="text-slate-600 mb-1">📍 123 Rue de l’Entreprise, Casablanca, Maroc</p>
          <p className="text-slate-600 mb-1">📞 +212 6 12 34 56 78</p>
          <p className="text-slate-600 mb-6">✉️ contact@stockmanager.com</p>
          <div className="flex justify-center gap-6 text-blue-600 text-sm mb-4">
            <a href="#" className="hover:text-blue-800 transition">Facebook</a>
            <a href="#" className="hover:text-blue-800 transition">LinkedIn</a>
            <a href="#" className="hover:text-blue-800 transition">GitHub</a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} <strong>StockManager</strong>. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}