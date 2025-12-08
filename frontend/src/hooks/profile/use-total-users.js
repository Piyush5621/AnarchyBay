import { useQuery } from "@tanstack/react-query";
import { getTotalUsers } from "@/services/auth/profile.service.js";
import { QUERY_KEYS } from "@/utils/constants.js";

export default function useTotalUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, QUERY_KEYS.TOTAL_USERS],
    queryFn: getTotalUsers,
    enabled: true,
    staleTime: 60_000,
  });
}
