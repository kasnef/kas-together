import endpoint from "@/services/endpoint";
import rootApi from "@/services/root.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export interface CreatRoomDto {
  token: string;
  dto: {
    name: string;
    description: string;
    roomType: string;
    password?: string;
    userLocalTime: string;
  };
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  const { data, mutateAsync, isPending } = useMutation({
    mutationKey: ["create"],
    mutationFn: async (dto: CreatRoomDto) => {
      const res = await rootApi.post(endpoint.create_room, {
        token: dto.token,
        dto: {
          name: dto.dto.name,
          description: dto.dto.description,
          roomType: dto.dto.roomType,
          password: dto.dto.password,
          userLocalTime: dto.dto.userLocalTime,
        },
      });
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["room", 0, 10]
      });
    },
    onError: () => {}
  });

  return {
    data,
    isPending,
    onCreateRoom: mutateAsync,
  };
};
