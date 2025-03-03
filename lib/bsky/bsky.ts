import { AtpAgent } from "@atproto/api";

const agent = new AtpAgent({
  service: "https://bsky.social",
});

export async function postText(text: string, facets: any[] = []): Promise<any> {
  try {
    await agent.login({
      identifier: process.env.BSKY_HANDLE!,
      password: process.env.BSKY_PW!,
    });

    const post = await agent.post({ text, facets });
    return post;
  } catch (error) {
    console.error("Error posting meme:", error);
    return null;
  }
}

export async function getFollowers(username: string, token: string) {
  try {
    const encodedUsername = encodeURIComponent(username);
    const followers = await fetch(
      `https://button.us-west.host.bsky.network/xrpc/app.bsky.graph.getFollows?actor=${encodedUsername}&limit=5`,
      {
        headers: {
          Authorization: `DPoP ${token}`,
          Dpop: `${token}`,
        },
      }
    );
    const data = await followers.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error posting meme:", error);
    return null;
  }
}

/**
 * Finds all hashtags in a text and returns their byte indices
 * @param text The text to search for hashtags
 * @returns An array of facets for each hashtag
 */
export function findHashtags(text: string) {
  // Regular expression to find hashtags (# followed by word characters)
  const hashtagRegex = /#(\w+)/g;
  const facets = [];

  // We need to work with byte indices, not character indices
  const textEncoder = new TextEncoder();

  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    const tag = match[1]; // The hashtag without the # symbol
    const fullTag = match[0]; // The full hashtag with the # symbol

    // Calculate byte indices
    const textBeforeMatch = text.substring(0, match.index);
    const byteStart = textEncoder.encode(textBeforeMatch).length;
    const byteEnd = byteStart + textEncoder.encode(fullTag).length;

    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: "app.bsky.richtext.facet#tag", tag }],
    });
  }

  return facets;
}
