import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useMutation } from "@tanstack/react-query";

export interface LeaveRoomDto {
  id: string;
  token: string;
}

export const useLeaveRoom = () => {
  const { data, mutateAsync, isPending } = useMutation({
    mutationKey: ["leave"],
    mutationFn: async (dto: LeaveRoomDto) => {
      const res = await rootApi.post(endpoint.leave_room, {
        id: dto.id,
        token: dto.token,
      });
      return res.data as any;
    },
  });

  return {
    data,
    isPending,
    onLeaveRoom: mutateAsync,
  };
};
