import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products/product.service.js";
import { QUERY_KEYS } from "../../utils/constants";

export default function useGetProducts() {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, QUERY_KEYS.PRODUCTS],
    queryFn: getProducts,
    enabled: true,
    staleTime: 60_000,
  });
}
