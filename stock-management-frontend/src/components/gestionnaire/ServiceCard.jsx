import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ServiceCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring" }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow border-0 bg-gradient-to-br from-blue-50 to-violet-50">
        <CardHeader className="flex flex-col items-center">
          <div className="text-4xl mb-2">{icon}</div>
          <CardTitle className="text-lg text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}