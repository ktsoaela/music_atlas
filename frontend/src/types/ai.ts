export type AIAskResponse = {
  answer: string;
  sources: Record<string, unknown>[];
  mode: string;
};
