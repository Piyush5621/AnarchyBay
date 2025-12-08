import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth";
import { getUserProfile } from "@/services/auth/profile.service.js";
import { QUERY_KEYS } from "@/utils/constants.js";

export default function useUserProfileInfo() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: [user?.id, QUERY_KEYS.USER_PROFILE],
    queryFn: () => getUserProfile(user.id),
    enabled: isAuthenticated && !!user?.id,
  });
}
