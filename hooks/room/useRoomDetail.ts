import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useMutation } from "@tanstack/react-query";

export interface roomDetailDto {
  token: string;
  roomId: string;
  dto: {};
}

export const useRoomDetailMutation = () => {
  const { data, isPending, isError, mutateAsync } = useMutation({
    mutationFn: async (params: roomDetailDto) => {
      const res = await rootApi.post(endpoint.room_detail, {
        token: params.token,
        roomId: params.roomId,
        dto: params.dto,
      });
      return res.data as any;
    },
    onSuccess: (data) => {},
    onError: (error) => {},
  });

  return {
    data,
    isPending,
    isError,
    onDetailRoom: mutateAsync
  }
};
