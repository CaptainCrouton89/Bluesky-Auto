import { findHashtags } from "./bsky";

/**
 * Posts text to Bluesky using the XRPC client
 * @param xrpc The XRPC client object
 * @param text The text to post
 * @returns The result of the post operation
 */
export async function postTextWithXRPC(xrpc: any, text: string) {
  try {
    if (!xrpc || !xrpc.handler) {
      throw new Error("XRPC client not properly initialized");
    }

    // Find hashtags in the text and create facets
    const facets = findHashtags(text);

    // Create the post record
    const record = {
      text,
      createdAt: new Date().toISOString(),
      $type: "app.bsky.feed.post",
    };

    // Add facets if there are any
    if (facets.length > 0) {
      Object.assign(record, { facets });
    }

    // Try to use the agent's API directly if available
    if (xrpc.handler.api?.app?.bsky?.feed?.post) {
      return await xrpc.handler.api.app.bsky.feed.post({
        text,
        facets: facets.length > 0 ? facets : undefined,
        createdAt: new Date().toISOString(),
      });
    }

    // Fallback to using the request method
    return await xrpc.request({
      type: "post",
      nsid: "com.atproto.repo.createRecord",
      params: {
        repo: xrpc.handler.session.info.sub,
        collection: "app.bsky.feed.post",
        record,
      },
    });
  } catch (error) {
    console.error("Error posting with XRPC:", error);
    throw error;
  }
}

/**
 * Gets the user's followers using the XRPC client
 * @param xrpc The XRPC client object
 * @param limit The maximum number of followers to retrieve
 * @returns The list of followers
 */
export async function getFollowersWithXRPC(xrpc: any, limit: number = 5) {
  try {
    if (!xrpc || !xrpc.handler) {
      throw new Error("XRPC client not properly initialized");
    }

    // Try to use the agent's API directly if available
    if (xrpc.handler.api?.app?.bsky?.graph?.getFollows) {
      const result = await xrpc.handler.api.app.bsky.graph.getFollows({
        actor: xrpc.handler.session.info.sub,
        limit,
      });
      return result.data.follows;
    }

    // Fallback to using the request method
    const result = await xrpc.request({
      type: "get",
      nsid: "app.bsky.graph.getFollows",
      params: {
        actor: xrpc.handler.session.info.sub,
        limit,
      },
    });

    return result.data.follows;
  } catch (error) {
    console.error("Error getting followers with XRPC:", error);
    throw error;
  }
}

/**
 * Gets the user's profile using the XRPC client
 * @param xrpc The XRPC client object
 * @returns The user's profile information
 */
export async function getProfileWithXRPC(xrpc: any) {
  try {
    if (!xrpc || !xrpc.handler) {
      throw new Error("XRPC client not properly initialized");
    }

    // Try to use the agent's API directly if available
    if (xrpc.handler.api?.app?.bsky?.actor?.getProfile) {
      const result = await xrpc.handler.api.app.bsky.actor.getProfile({
        actor: xrpc.handler.session.info.sub,
      });
      return result.data;
    }

    // Fallback to using the request method
    const result = await xrpc.request({
      type: "get",
      nsid: "app.bsky.actor.getProfile",
      params: {
        actor: xrpc.handler.session.info.sub,
      },
    });

    return result.data;
  } catch (error) {
    console.error("Error getting profile with XRPC:", error);
    throw error;
  }
}
