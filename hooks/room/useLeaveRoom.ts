import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface LeaveRoomDto {
  id: string;
  token: string;
}

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  const { data, mutateAsync, isPending } = useMutation({
    mutationKey: ["leave"],
    mutationFn: async (dto: LeaveRoomDto) => {
      const res = await rootApi.post(endpoint.leave_room, {
        id: dto.id,
        token: dto.token,
      });
      return res.data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
      });
    },
  });

  return {
    data,
    isPending,
    onLeaveRoom: mutateAsync,
  };
};
