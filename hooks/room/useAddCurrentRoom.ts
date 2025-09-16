import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface AddCurrentRoomDto {
  userId: string;
  joinedAt: string;
  dto: {
    room_id: string;
    room_name: string;
    room_description: string;
    room_type: string;
    room_password: string | null;
    room_createdAt: string;
    room_ownerId: string;
    memberCount: number;
  };
}

export const useAddCurrentRoom = () => {
  const queryClient = useQueryClient();

  const { data, mutateAsync, isPending } = useMutation({
    mutationKey: ["add-current"],
    mutationFn: async (dto: AddCurrentRoomDto) => {
      const res = await rootApi.post(endpoint.add_current_room, {
        userId: dto.userId,
        joinedAt: dto.joinedAt,
        dto: {
          room_id: dto.dto.room_id,
          room_name: dto.dto.room_name,
          room_description: dto.dto.room_description,
          room_type: dto.dto.room_type,
          room_password: dto.dto.room_password,
          room_createdAt: dto.dto.room_createdAt,
          room_ownerId: dto.dto.room_ownerId,
          memberCount: dto.dto.memberCount,
        },
      });
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["room", 0, 10],
      });
    },
    onError: () => {},
  });

  return {
    data,
    isPending,
    onAddCurrentRoom: mutateAsync,
  };
};
