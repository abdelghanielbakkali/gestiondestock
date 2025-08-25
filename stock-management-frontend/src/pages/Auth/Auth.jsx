import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import ForgetPassword from "./ForgetPassword";
import { Sparkles } from "lucide-react";

export default function Auth() {
  const [view, setView] = useState("login"); // "login" | "register" | "forgot"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <Sparkles className="text-blue-600" size={48} />
        </div>
        <div className="flex justify-center gap-4 mb-8">
          <button
            className={`font-semibold px-4 py-2 rounded-full transition-all ${
              view === "login"
                ? "bg-blue-600 text-white shadow"
                : "text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setView("login")}
          >
            Connexion
          </button>
          <button
            className={`font-semibold px-4 py-2 rounded-full transition-all ${
              view === "register"
                ? "bg-blue-600 text-white shadow"
                : "text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setView("register")}
          >
            Inscription
          </button>
        </div>
        {view === "login" && <Login onForgot={() => setView("forgot")} />}
        {view === "register" && <Register onSuccess={() => setView("login")} />}
        {view === "forgot" && (
          <ForgetPassword onBack={() => setView("login")} />
        )}
      </div>
    </div>
  );
}