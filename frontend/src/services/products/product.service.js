import api from "../../lib/api/client.js";

export const getProducts = async () => {
  const data = await api.get(
    '/api/products/list',
    {requireAuth: false}
  );
  return data; // array of products
}

export const getTotalProducts = async () => {
  const { count } = await api.get(
    '/api/products/total',
    {requireAuth: false}
  );
  return count || 0;
}