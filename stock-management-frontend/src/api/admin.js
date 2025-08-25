import api from "../lib/axios";

// ==================== UTILISATEURS ====================
export const fetchUsers = (params) => api.get("/users", { params });
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.post(`/users/${id}?_method=PUT`, data); // FormData compatible
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ==================== PRODUITS ====================
export const fetchProducts = (params) => api.get("/produits", { params });
export const createProduct = (data) => api.post("/produits", data);
export const updateProduct = (id, data) => api.post(`/produits/${id}?_method=PUT`, data);
export const deleteProduct = (id) => api.delete(`/produits/${id}`);

// ==================== CATÉGORIES ====================
export const fetchCategories = (params) => api.get("/categories", { params });
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.post(`/categories/${id}?_method=PUT`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ==================== COMMANDES ====================
export const fetchOrders = (params) => api.get("/commandes", { params });
export const fetchOrder = (id) => api.get(`/commandes/${id}`);
export const createOrder = (data) => api.post("/commandes", data);
export const updateOrder = (id, data) => api.post(`/commandes/${id}?_method=PUT`, data);
export const deleteOrder = (id) => api.delete(`/commandes/${id}`);

// ==================== FOURNISSEURS ====================
export const fetchSuppliers = (params) => api.get("/fournisseurs", { params });
export const createSupplier = (data) => api.post("/fournisseurs", data);
export const updateSupplier = (id, data) => api.post(`/fournisseurs/${id}?_method=PUT`, data);
export const deleteSupplier = (id) => api.delete(`/fournisseurs/${id}`);

// ==================== DEMANDES DE CRÉATION DE COMPTE ====================
export const fetchAccountRequests = (params) => api.get("/demandes-creation-compte", { params });
export const acceptAccountRequest = (id) => api.post(`/demandes-creation-compte/${id}/accept`);
export const refuseAccountRequest = (id) => api.post(`/demandes-creation-compte/${id}/refuse`);
export const deleteAccountRequest = (id) => api.delete(`/demandes-creation-compte/${id}`);

// ==================== NOTIFICATIONS ====================
export const fetchNotifications = (params) => api.get("/notifications", { params });
export const markNotificationAsRead = (id) => api.post(`/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ==================== RAPPORTS ====================
export const fetchReports = (params) => api.get("/rapports", { params });
export const fetchReport = (id) => api.get(`/rapports/${id}`);
export const createReport = (data) => api.post("/rapports", data);
export const deleteReport = (id) => api.delete(`/rapports/${id}`);

// ==================== LIGNES DE COMMANDE ====================
export const fetchOrderLines = (params) => api.get("/lignes-de-commande", { params });
export const createOrderLine = (data) => api.post("/lignes-de-commande", data);
export const updateOrderLine = (id, data) => api.post(`/lignes-de-commande/${id}?_method=PUT`, data);
export const deleteOrderLine = (id) => api.delete(`/lignes-de-commande/${id}`);

// ==================== LIVRAISONS ====================
export const fetchDeliveries = (params) => api.get("/livraisons", { params });
export const createDelivery = (data) => api.post("/livraisons", data);
export const updateDelivery = (id, data) => api.post(`/livraisons/${id}?_method=PUT`, data);
export const deleteDelivery = (id) => api.delete(`/livraisons/${id}`);
