import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useQuery } from "@tanstack/react-query";

export interface checkCurrent {
  user_id: string;
}

export const useCheckCurrent = (userId: string) => {
  return useQuery({
    queryKey: ["current", userId],
    queryFn: async ({ queryKey }) => {
      const [, uid] = queryKey as [string, string];
      const queryParam = new URLSearchParams({
        user_id: uid.toString(),
      });
      const url = `${endpoint.check_current_room}?${queryParam.toString()}`;
      const res = await rootApi.get(url);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
