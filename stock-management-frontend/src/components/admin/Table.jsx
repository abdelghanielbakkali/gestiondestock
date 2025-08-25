export default function Table({ columns, data, loading, emptyMessage, actions }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-blue-50 text-blue-800">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2">{col.label}</th>
            ))}
            {actions && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">Chargement...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">{emptyMessage || "Aucune donnée."}</td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-2 flex gap-2">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}