import { useQuery } from "@tanstack/react-query";
import { getTotalProducts } from "@/services/products/product.service.js";
import { QUERY_KEYS } from "../../utils/constants";

export default function useTotalProducts() {

  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, QUERY_KEYS.TOTAL_PRODUCTS],
    queryFn: getTotalProducts,
  });
}
