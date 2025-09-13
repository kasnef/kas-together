import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useMutation } from "@tanstack/react-query";

export interface JoinRoomDto {
  id: string;
  token: string;
  userLocalTime: string;
  password?: string;
}

export const useJoinRoom = () => {
  const { data, mutateAsync, isPending } = useMutation({
    mutationKey: ["join"],
    mutationFn: async (dto: JoinRoomDto) => {
      const res = await rootApi.post(endpoint.join_room, {
        id: dto.id,
        token: dto.token,
        userLocalTime: dto.userLocalTime,
        password: dto.password,
      });
      return res as any;
    },
  });

  return {
    data,
    isPending,
    onJoinRoom: mutateAsync,
  };
};