import { AtpAgent } from "@atproto/api";

const agent = new AtpAgent({
  service: "https://bsky.social",
});

export async function postText(text: string): Promise<any> {
  try {
    await agent.login({
      identifier: process.env.BSKY_HANDLE!,
      password: process.env.BSKY_PW!,
    });

    const post = await agent.post({ text });
    return post;
  } catch (error) {
    console.error("Error posting meme:", error);
    return null;
  }
}
