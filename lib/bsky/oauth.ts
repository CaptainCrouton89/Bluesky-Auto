// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Import React types
import { RefObject, useEffect, useState } from "react";
import { getFollowersWithXRPC } from "./client";
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

// Handle OAuth redirect - can be used in a useEffect
export async function handleOauth() {
  if (!isBrowser) return null;

  if (!location.href.includes("state")) {
    return null;
  }

  return await finalize();
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

  return { agent };
}

// Create a proper XRPC wrapper that uses the OAuthUserAgent
export function createXRPC(agent: any) {
  return {
    handler: agent,
    // Implement the request method that uses the agent's request method
    request: async (params: any) => {
      try {
        const { type, nsid, params: requestParams } = params;

        // For GET requests
        if (type === "get") {
          // Use the agent's com.atproto.* or app.bsky.* methods directly
          const result =
            await agent.api.com.atproto.repo.listRecords(requestParams);
          return { data: result.data };
        }
        // For POST requests
        else if (type === "post") {
          if (nsid === "com.atproto.repo.createRecord") {
            const result =
              await agent.api.com.atproto.repo.createRecord(requestParams);
            return { data: result.data };
          }
        }

        // If we don't have a specific handler, use a generic request
        // This is a fallback and might not work for all endpoints
        console.warn(`No specific handler for ${nsid}, using generic request`);

        // Construct the URL
        const baseUrl = "https://bsky.social/xrpc/";
        const url = `${baseUrl}${nsid}`;

        // For GET requests, append params to URL
        let fetchUrl = url;
        if (type === "get" && requestParams) {
          const queryParams = new URLSearchParams();
          Object.entries(requestParams).forEach(([key, value]) => {
            queryParams.append(key, String(value));
          });
          fetchUrl = `${url}?${queryParams.toString()}`;
        }

        // Prepare fetch options
        const fetchOptions: RequestInit = {
          method: type === "get" ? "GET" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${agent.session.accessJwt}`,
          },
        };

        // For POST requests, add body
        if (type === "post" && requestParams) {
          fetchOptions.body = JSON.stringify(requestParams);
        }

        // Use the standard fetch API with the authorization header
        const response = await fetch(fetchUrl, fetchOptions);

        if (!response.ok) {
          throw new Error(
            `XRPC request failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return { data };
      } catch (error) {
        console.error("XRPC request error:", error);
        throw error;
      }
    },
  };
}

// Interface for the return value of useBlueskyAuth
interface BlueskyAuthHook {
  agent: typeof OAuthUserAgent;
  xrpc: typeof XRPC;
  usernameRef: RefObject<HTMLInputElement | null>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
  getFollowers: () => Promise<any>;
}

// React hook to handle Bluesky authentication
export function useBlueskyAuth(
  usernameRef: RefObject<HTMLInputElement | null>
): BlueskyAuthHook {
  const [xrpc, setXRPC] = useState<any>(null);
  const [agent, setAgent] = useState<typeof OAuthUserAgent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await initModules();

      // Check if we're in an OAuth redirect
      const agent = await handleOauth();
      if (agent) {
        setAgent(agent);
        setXRPC(createXRPC(agent));
      } else {
        // Try to restore from session
        const sessionResult = await restoreSession();
        if (sessionResult) {
          setAgent(sessionResult.agent);
          setXRPC(createXRPC(sessionResult.agent));
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

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

  const logout = async () => {
    await agent?.signOut();
  };

  const getFollowers = async () => {
    if (!xrpc || !agent) {
      console.error("XRPC or agent not initialized");
      return [];
    }

    try {
      // Try to use the agent's API directly if available
      if (agent.api?.app?.bsky?.graph?.getFollows) {
        const result = await agent.api.app.bsky.graph.getFollows({
          actor: agent.session.info.sub,
          limit: 5,
        });
        return result.data.follows;
      }

      // Fallback to using the client function
      return await getFollowersWithXRPC(xrpc);
    } catch (error) {
      console.error("Error getting followers:", error);
      return [];
    }
  };

  return {
    getFollowers,
    xrpc,
    agent,
    usernameRef,
    login,
    logout,
    isLoading,
    isLoggedIn: !!agent,
  };
}

// Remove any remaining non-React code
if (typeof window !== "undefined") {
  // Initialize modules when the file is imported
  initModules();
}
