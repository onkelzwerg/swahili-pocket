export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "other";

export type NounClass = "M-Wa" | "M-Mi" | "Ki-Vi" | "N" | "U" | "Pa-Ku-Mu" | "Ji-Ma" | "Ku";

export interface Example {
  sw: string;
  de: string;
}

export interface VocabEntry {
  id: string;
  /** Reference to shared_vocab pool entry; undefined for private (manually added) vocab. */
  sharedId?: string;
  /** True when the vocab was manually added by the user and is not part of the shared pool. */
  isPrivate?: boolean;
  swahili: string;
  german: string;
  partOfSpeech: PartOfSpeech;
  nounClass?: NounClass;
  examples: Example[];
  box: 1 | 2 | 3 | 4 | 5;
  nextReview: number;
  createdAt: number;
  updatedAt?: number;
  /** False when the underlying pool entry has been deactivated by an admin. */
  sharedIsActive?: boolean;
}

export interface UserStats {
  streak: number;
  lastReviewDate: string;
  totalReviewed: number;
  xp: number;
}

export type DialogueSpeaker = "A" | "B" | "C";

export interface Dialogue {
  id: string;
  title: string;
  titleDe: string;
  emoji: string;
  turns: { speaker: DialogueSpeaker; sw: string; de: string }[];
  /** Map Sprecher → VoiceProfile.id (siehe src/lib/voices.ts). */
  voiceMap?: Record<string, string>;
  level?: "beginner" | "intermediate" | "advanced";
}

export interface NounClassInfo {
  id: NounClass;
  name: string;
  singular: string;
  plural: string;
  meaning: string;
  subjectPrefix: { sg: string; pl: string };
  objectPrefix: { sg: string; pl: string };
  genitive: { sg: string; pl: string };
  demonstratives: {
    near: { sg: string; pl: string };
    far: { sg: string; pl: string };
  };
  examples: { sw: string; de: string }[];
}
