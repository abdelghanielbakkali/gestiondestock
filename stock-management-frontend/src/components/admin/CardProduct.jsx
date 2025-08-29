import { Eye, Pencil, Trash } from "lucide-react";

function buildImageSrc(product) {
  // 1) URL Cloudinary/absolue
  if (product?.image && /^https?:\/\//i.test(product.image)) return product.image;
  if (product?.image_url && /^https?:\/\//i.test(product.image_url)) return product.image_url;

  // 2) Base backend depuis VITE_API_URL
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const backendBase = apiUrl.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";

  // 3) URL déjà construite par le backend
  if (product?.image_url) return product.image_url;

  // 4) Chemin relatif → prefixer /storage/
  if (product?.image) return `${backendBase}/storage/${product.image}`;

  // 5) Fallback
  return "/src/assets/stock-management.jpeg";
}

export default function CardProduct({ product, onEdit, onDelete, onView }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative">
      <img
        src={buildImageSrc(product)}
        alt={product.nom}
        className="w-24 h-24 object-cover rounded-xl mb-2"
        onError={(e) => { e.currentTarget.src = "/src/assets/stock-management.jpeg"; }}
      />
      <h3 className="text-lg font-bold text-blue-800 mb-1">{product.nom}</h3>
      <p className="text-slate-600 text-sm mb-2">
        {product.categorie?.nom || "Sans catégorie"}
      </p>
      <div className="flex gap-2 mb-2">
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
          Stock: {product.stock}
        </span>
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
          {product.prix} DH
        </span>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => onView(product)}
          title="Voir détails"
        >
          <Eye size={18} className="text-blue-600" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => onEdit(product)}
          title="Modifier"
        >
          <Pencil size={18} className="text-yellow-600" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => onDelete(product)}
          title="Supprimer"
        >
          <Trash size={18} className="text-red-600" />
        </button>
      </div>
    </div>
  );
}