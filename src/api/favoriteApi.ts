import axios from "axios";
import { Product } from "../types/Product";

const API_URL = "http://localhost:8080/api/favorites";

export const getFavorites = async (userId: number): Promise<any[]> => {
  const response = await axios.get<any[]>(`${API_URL}?userId=${userId}`);
  return response.data;
};

export const addFavorite = async (userId: number, productId: number): Promise<void> => {
  await axios.post(API_URL, { userId, productId });
};

export const removeFavorite = async (userId: number, productId: number): Promise<void> => {
  await axios.delete(`${API_URL}?userId=${userId}&productId=${productId}`);
};
