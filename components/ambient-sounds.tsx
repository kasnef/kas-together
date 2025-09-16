import { useState, useRef, forwardRef, useImperativeHandle } from "react";

interface AmbientSound {
  id: string;
  name: string;
  url: string;
  isPlaying: boolean;
  volume: number;
}

export interface AmbientSoundsRef {
  toggleSound: (id: string) => void;
  updateVolume: (id: string, volume: number) => void;
}

export const AmbientSounds = forwardRef<AmbientSoundsRef>((_, ref) => {
  const [sounds, setSounds] = useState<AmbientSound[]>([
    {
      id: "rain",
      name: "Rain",
      url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/sound-ambient/rain.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "water",
      name: "Water",
      url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/sound-ambient/water.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "thunder",
      name: "Thunder",
      url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/sound-ambient/thunder.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "keyboard",
      name: "Keyboard",
      url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/sound-ambient/keyboard.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "nature",
      name: "Nature",
      url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/sound-ambient/nature.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "coffee",
      name: "Coffee",
      url: "https://pub-9166648ee67849e49f401e8c823a3279.r2.dev/sound-ambient/coffe_shop.mp3",
      isPlaying: false,
      volume: 50,
    },
  ]);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const toggleSound = (id: string) => {
    setSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const audio = audioRefs.current[id];
          console.log("sounds -==> ", audio)
          if (audio) {
            if (s.isPlaying) audio.pause();
            else audio.play();
          }
          return { ...s, isPlaying: !s.isPlaying };
        }
        return s;
      })
    );
  };

  const updateVolume = (id: string, volume: number) => {
    setSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const audio = audioRefs.current[id];
          if (audio) audio.volume = volume / 100;
          return { ...s, volume };
        }
        return s;
      })
    );
  };

  // expose methods ra ngoài cho UnifiedMenu gọi
  useImperativeHandle(ref, () => ({
    toggleSound,
    updateVolume,
  }));

  return (
    <>
      {sounds.map((s) => (
        <audio
          key={s.id}
          ref={(el) => {
            if (el) audioRefs.current[s.id] = el;
          }}
          src={s.url}
          loop
        />
      ))}
    </>
  );
});
