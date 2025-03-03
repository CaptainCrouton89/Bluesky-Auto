import { api } from "../api";

export async function postTextAction(text: string) {
  await api.post("/api/protected/bsky", { text });
}
