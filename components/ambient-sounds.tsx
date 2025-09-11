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
      url: "https://sv2gb.sharepoint.com/sites/kas-on-cloud/Shared%20Documents/rain.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "water",
      name: "Water",
      url: "https://sv2gb.sharepoint.com/sites/kas-on-cloud/Shared%20Documents/water.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "thunder",
      name: "Thunder",
      url: "https://sv2gb.sharepoint.com/sites/kas-on-cloud/Shared%20Documents/thunder.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "keyboard",
      name: "Keyboard",
      url: "https://sv2gb.sharepoint.com/sites/kas-on-cloud/Shared%20Documents/keyboard.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "nature",
      name: "Nature",
      url: "https://sv2gb.sharepoint.com/sites/kas-on-cloud/Shared%20Documents/nature.mp3",
      isPlaying: false,
      volume: 50,
    },
    {
      id: "coffee",
      name: "Coffee",
      url: "https://sv2gb.sharepoint.com/sites/kas-on-cloud/Shared%20Documents/coffee_shop.mp3",
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
