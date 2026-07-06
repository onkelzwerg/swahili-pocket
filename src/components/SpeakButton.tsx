import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { speak, createUnlockedAudio } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { T } from "@/config/translations";

interface Props {
  text: string;
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

export function SpeakButton({ text, className, size = "md", label }: Props) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async (e) => {
        e.stopPropagation();
        const audio = createUnlockedAudio();
        setLoading(true);
        try {
          await speak(text, audio);
        } finally {
          setLoading(false);
        }
      }}
      aria-label={label ?? T.speakButton.ariaPlay(text)}
      aria-busy={loading}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-ochre/20 text-ochre-foreground transition-all active:scale-90 hover:bg-ochre/30 disabled:opacity-90",
        dim,
        className,
      )}
    >
      {loading ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        <Volume2 className={iconSize} />
      )}
    </button>
  );
}
