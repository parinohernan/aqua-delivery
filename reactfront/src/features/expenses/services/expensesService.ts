import apiClient, { getApiBaseUrl } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { API_ENDPOINTS } from '@/utils/constants';
import type { Expense, ExpenseType, Vehicle, VehicleStats, CreateExpensePayload, ExpenseDocument } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

interface ExpensesFilters {
  app_id?: string;
  type?: string;
  vehicle_id?: string;
  date_from?: string;
  date_to?: string;
  /** Solo admin: filtrar por código de vendedor (user_id del gasto). */
  user_id?: string;
  limit?: number;
  offset?: number;
}

export const expensesService = {
  // ---- EXPENSES ----
  async getAll(filters?: ExpensesFilters): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.append(key, String(value));
      });
    }
    const query = params.toString();
    const url = `${API_ENDPOINTS.EXPENSES}${query ? `?${query}` : ''}`;
    const response = await apiClient.get<ApiResponse<Expense[]>>(url);
    return response.data;
  },

  async getById(id: string): Promise<Expense> {
    const response = await apiClient.get<ApiResponse<Expense>>(`${API_ENDPOINTS.EXPENSES}/${id}`);
    return response.data;
  },

  async create(payload: CreateExpensePayload): Promise<Expense> {
    const response = await apiClient.post<ApiResponse<Expense>>(API_ENDPOINTS.EXPENSES, payload);
    return response.data;
  },

  async update(id: string, data: Partial<CreateExpensePayload>): Promise<Expense> {
    const response = await apiClient.put<ApiResponse<Expense>>(`${API_ENDPOINTS.EXPENSES}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.EXPENSES}/${id}`);
  },

  // ---- DOCUMENTS ----
  async getDocuments(expenseId: string): Promise<ExpenseDocument[]> {
    const response = await apiClient.get<ApiResponse<ExpenseDocument[]>>(
      `${API_ENDPOINTS.EXPENSES}/${expenseId}/documents`
    );
    return response.data;
  },

  async uploadDocuments(
    expenseId: string,
    files: { file_name: string; file_type: string; base64?: string; public_url?: string }[]
  ): Promise<ExpenseDocument[]> {
    const response = await apiClient.post<ApiResponse<ExpenseDocument[]>>(
      `${API_ENDPOINTS.EXPENSES}/${expenseId}/documents`,
      { files }
    );
    return response.data;
  },

  /**
   * Sube imagen de comprobante a Cloudinary (misma idea que productos).
   */
  async uploadExpenseImage(file: File): Promise<{ imageURL: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró sesión. Inicie sesión de nuevo.');
    }

    const base = getApiBaseUrl();
    const url = `${base || ''}${endpoints.uploadExpenseImage()}`;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = (await res.json()) as { error?: string; imageURL?: string };
    if (!res.ok) {
      throw new Error(data.error || 'Error al subir la imagen');
    }
    if (!data.imageURL) {
      throw new Error('Respuesta inválida del servidor');
    }
    return { imageURL: data.imageURL };
  },

  async deleteDocument(expenseId: string, docId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.EXPENSES}/${expenseId}/documents/${docId}`);
  },

  // ---- EXPENSE TYPES ----
  async getExpenseTypes(appId?: string): Promise<ExpenseType[]> {
    const url = appId
      ? `${API_ENDPOINTS.EXPENSE_TYPES}?app_id=${appId}`
      : API_ENDPOINTS.EXPENSE_TYPES;
    const response = await apiClient.get<ApiResponse<ExpenseType[]>>(url);
    return response.data;
  },

  // ---- VEHICLES ----
  async getVehicles(status?: string): Promise<Vehicle[]> {
    const url = status
      ? `${API_ENDPOINTS.VEHICLES}?status=${status}`
      : API_ENDPOINTS.VEHICLES;
    const response = await apiClient.get<ApiResponse<Vehicle[]>>(url);
    return response.data;
  },

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await apiClient.get<ApiResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES}/${id}`);
    return response.data;
  },

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.post<ApiResponse<Vehicle>>(API_ENDPOINTS.VEHICLES, data);
    return response.data;
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.put<ApiResponse<Vehicle>>(`${API_ENDPOINTS.VEHICLES}/${id}`, data);
    return response.data;
  },

  async getVehicleStats(id: string): Promise<VehicleStats> {
    const response = await apiClient.get<ApiResponse<VehicleStats>>(`${API_ENDPOINTS.VEHICLES}/${id}/stats`);
    return response.data;
  },
};
