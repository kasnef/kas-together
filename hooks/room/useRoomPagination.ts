import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useQuery } from "@tanstack/react-query";

export interface roomPagination {
  skip: number;
  take: number;
}

export const useRoomPagination = (skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: ["room", skip, take],
    queryFn: async ({ queryKey }) => {
      const [, skip, take] = queryKey as [string, number, number];
      const queryParam = new URLSearchParams({
        skip: skip.toString(),
        take: take.toString(),
      });
      const url = `${endpoint.room_pagination}?${queryParam.toString()}`;
      const res = await rootApi.get(url);
      return res.data.data;
    },
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
