// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Import modules dynamically
let XRPC: any;
let OAuthUserAgent: any;
let configureOAuth: any;
let createAuthorizationUrl: any;
let finalizeAuthorization: any;
let getSession: any;
let resolveFromIdentity: any;

// Declare global variables
declare global {
  interface Window {
    login: any;
    xrpc: any;
    agent: any;
  }
}

// Initialize modules
async function initModules() {
  if (!isBrowser) return;

  const clientModule = await import("@atcute/client");
  const oauthModule = await import("@atcute/oauth-browser-client");

  XRPC = clientModule.XRPC;
  OAuthUserAgent = oauthModule.OAuthUserAgent;
  configureOAuth = oauthModule.configureOAuth;
  createAuthorizationUrl = oauthModule.createAuthorizationUrl;
  finalizeAuthorization = oauthModule.finalizeAuthorization;
  getSession = oauthModule.getSession;
  resolveFromIdentity = oauthModule.resolveFromIdentity;

  // Configure OAuth after imports are ready
  configureOAuth({
    metadata: {
      client_id: `${APP_URL}/client-metadata.json`,
      redirect_uri: `${APP_URL}`,
    },
  });
}

const APP_URL = "https://bsky-auto.vercel.app/";

// Add sleep function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function bskyLogin() {
  if (!isBrowser) return;

  // Initialize modules if not already initialized
  if (!XRPC) {
    await initModules();
  }

  const usernameElement = document.getElementById("username");
  if (!usernameElement) return;
  const username = (usernameElement as HTMLInputElement).value;
  const { identity, metadata } = await resolveFromIdentity(username);
  const authUrl = await createAuthorizationUrl({
    metadata: metadata,
    identity: identity,
    scope: "atproto transition:generic transition:chat.bsky",
  });
  window.location.assign(authUrl);
  await sleep(200);
}

async function finalize() {
  if (!isBrowser) return null;

  const params = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, "", location.pathname + location.search);
  const session = await finalizeAuthorization(params);
  const agent = new OAuthUserAgent(session);
  return agent;
}

//export interface XRPCRequestOptions {
//	type: 'get' | 'post';
//	nsid: string;
//	headers?: HeadersInit;
//	params?: Record<string, unknown>;
//	data?: FormData | Blob | ArrayBufferView | Record<string, unknown>;
//	signal?: AbortSignal;
//}
async function getFollowing(xrpc: any) {
  const following = await xrpc.request({
    type: "get",
    nsid: "app.bsky.graph.getFollows",
    params: {
      actor: window.agent.session.info.sub,
      limit: 5,
    },
  });
  return following.data.follows;
}

function display(follows: any[]) {
  // create new <ul>
  const list = document.createElement("ul");
  for (const follow of follows) {
    const item = document.createElement("li");
    item.textContent = follow.handle;
    list.appendChild(item);
  }
  const followingElement = document.getElementById("following");
  if (!followingElement) return;
  followingElement.textContent = "5 people you're following:";
  followingElement.appendChild(list);
}

async function handleOauth() {
  if (!isBrowser) return;

  if (!location.href.includes("state")) {
    return;
  }
  const agent = await finalize();
  window.xrpc = new XRPC({ handler: agent });
  window.agent = agent;
}

async function restoreSession() {
  if (!isBrowser) return;

  const sessions = localStorage.getItem("atcute-oauth:sessions");
  if (!sessions) {
    return;
  }
  const did = Object.keys(JSON.parse(sessions))[0];
  const session = await getSession(did, { allowStale: true });
  const agent = new OAuthUserAgent(session);
  window.xrpc = new XRPC({ handler: agent });
  window.agent = agent;
}

// Only run in browser environment
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", async function () {
    await initModules(); // Initialize modules first
    await handleOauth();
    await restoreSession();
    if (!window.xrpc) {
      return;
    }
    const follows = await getFollowing(window.xrpc);
    display(follows);
  });
}

// Define login function for window assignment
function login() {
  bskyLogin();
}

// Assign login function to window
if (isBrowser) {
  window.login = login;
}
