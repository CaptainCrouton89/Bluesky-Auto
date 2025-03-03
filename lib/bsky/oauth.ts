// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Import React types
import { RefObject, useEffect, useState } from "react";
import {
  createAuthorizationUrl,
  finalizeAuthorization,
  getSession,
  initModules,
  OAuthUserAgent,
  resolveFromIdentity,
  XRPC,
} from "./oauthInit";

// Add sleep function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize modules

// React-compatible login function that takes a username ref instead of accessing DOM directly
export async function bskyLogin(
  usernameRef: RefObject<HTMLInputElement | null>
) {
  if (!isBrowser) return;

  // Initialize modules if not already initialized
  if (!XRPC) {
    await initModules();
  }

  // Use the ref instead of document.getElementById
  if (!usernameRef.current) return;
  const username = usernameRef.current.value;

  const { identity, metadata } = await resolveFromIdentity(username);
  const authUrl = await createAuthorizationUrl({
    metadata: metadata,
    identity: identity,
    scope: "atproto transition:generic transition:chat.bsky",
  });

  window.location.assign(authUrl);
  await sleep(200);
}

// Finalize OAuth process - can be called in a useEffect when detecting OAuth redirect
export async function finalize() {
  if (!isBrowser) return null;

  const params = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, "", location.pathname + location.search);
  const session = await finalizeAuthorization(params);
  const agent = new OAuthUserAgent(session);
  return agent;
}

// Get following list - returns data instead of manipulating DOM
export async function getFollowing(xrpc: any) {
  const following = await xrpc.request({
    type: "get",
    nsid: "app.bsky.graph.getFollows",
    params: {
      actor: xrpc.handler.session.info.sub,
      limit: 5,
    },
  });
  return following.data.follows;
}

// Handle OAuth redirect - can be used in a useEffect
export async function handleOauth() {
  if (!isBrowser) return null;

  if (!location.href.includes("state")) {
    return null;
  }

  const agent = await finalize();
  const xrpc = new XRPC({ handler: agent });

  return { agent, xrpc };
}

// Restore session from localStorage - can be used in a useEffect
export async function restoreSession() {
  if (!isBrowser) return null;

  const sessions = localStorage.getItem("atcute-oauth:sessions");
  if (!sessions) {
    return null;
  }

  const did = Object.keys(JSON.parse(sessions))[0];
  const session = await getSession(did, { allowStale: true });
  const agent = new OAuthUserAgent(session);
  const xrpc = new XRPC({ handler: agent });

  return { agent, xrpc };
}

// Interface for the return value of useBlueskyAuth
interface BlueskyAuthHook {
  agent: any;
  xrpc: any;
  follows: any[];
  usernameRef: RefObject<HTMLInputElement | null>;
  login: () => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
}

// React hook to handle Bluesky authentication
export function useBlueskyAuth(
  usernameRef: RefObject<HTMLInputElement | null>
): BlueskyAuthHook {
  const [agent, setAgent] = useState<any>(null);
  const [xrpc, setXrpc] = useState<any>(null);
  const [follows, setFollows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initModules();

      // Check if we're in an OAuth redirect
      const oauthResult = await handleOauth();
      if (oauthResult) {
        setAgent(oauthResult.agent);
        setXrpc(oauthResult.xrpc);
      } else {
        // Try to restore from session
        const sessionResult = await restoreSession();
        if (sessionResult) {
          setAgent(sessionResult.agent);
          setXrpc(sessionResult.xrpc);
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  // Fetch following when xrpc is available
  useEffect(() => {
    const fetchFollowing = async () => {
      if (xrpc) {
        try {
          const followingData = await getFollowing(xrpc);
          setFollows(followingData);
        } catch (error) {
          console.error("Error fetching following:", error);
        }
      }
    };

    if (xrpc) {
      fetchFollowing();
    }
  }, [xrpc]);

  // Login function
  const login = async () => {
    setIsLoading(true);
    try {
      await bskyLogin(usernameRef);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    agent,
    xrpc,
    follows,
    usernameRef,
    login,
    isLoading,
    isLoggedIn: !!agent,
  };
}

// Helper function to format follows data for display in React components
export function formatFollows(follows: any[]): Array<{
  handle: string;
  displayName: string;
  avatar: string;
}> {
  return follows.map((follow) => ({
    handle: follow.handle,
    displayName: follow.displayName,
    avatar: follow.avatar,
  }));
}

// Remove any remaining non-React code
if (typeof window !== "undefined") {
  // Initialize modules when the file is imported
  initModules();
}
