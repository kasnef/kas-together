export type ChatSound = {
  id: string;
  name: string;
  url: string;
};

// Default sound lists for sending and receiving messages
export const messageSendSounds: ChatSound[] = [
  {
    id: "send_pop",
    name: "Pop",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/send_message_1.mp3",
  },
  {
    id: "send_jug",
    name: "Jug",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/send_message_2.mp3",
  },
  {
    id: "send_iphone",
    name: "Iphone",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/send_messaeg_3.mp3",
  },
  {
    id: "send_piu",
    name: "Piu",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/send_message_4.mp3",
  },
];

export const messageReceiveSounds: ChatSound[] = [
  {
    id: "receive_ding",
    name: "Bell",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/new_message.mp3",
  },
  {
    id: "receive_bell",
    name: "Quack",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/new_message_2.mp3",
  },
  {
    id: "receive_note",
    name: "Ding",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/new_message_3.mp3",
  },
  {
    id: "receive_lamella_phone",
    name: "Lamellaphone",
    url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/message_sound/new_message_4.mp3",
  },
];

export const DEFAULT_SEND_SOUND_ID = messageSendSounds[0]?.id || "send_pop";
export const DEFAULT_RECEIVE_SOUND_ID = messageReceiveSounds[0]?.id || "receive_ding";

export function findSoundUrlById(
  list: ChatSound[],
  id: string | null | undefined
): string | null {
  if (!id) return null;
  const found = list.find((s) => s.id === id);
  return found ? found.url : null;
}


