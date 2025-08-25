// src/components/Navbar.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white via-blue-50 to-white shadow-md sticky top-0 z-50 backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <a href="#about" className="flex items-center gap-2">
        <Sparkles className="text-blue-600" />
        <span className="font-extrabold text-2xl tracking-tight text-blue-800">StockFlow</span>
      </a>

      {/* Navigation Links */}
      <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
        <a href="#about" className="hover:text-blue-600 transition-colors duration-200">À propos</a>
        <a href="#services" className="hover:text-blue-600 transition-colors duration-200">Services</a>
        <a href="#contact" className="hover:text-blue-600 transition-colors duration-200">Contact</a>
        <Link to="/auth">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-sm">
            Commencer
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}
