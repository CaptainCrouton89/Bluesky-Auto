// Import modules dynamically
export let XRPC: any;
export let OAuthUserAgent: any;
export let configureOAuth: any;
export let createAuthorizationUrl: any;
export let finalizeAuthorization: any;
export let getSession: any;
export let resolveFromIdentity: any;

const isBrowser = typeof window !== "undefined";

// Declare global variables
declare global {
  interface Window {
    login: any;
    xrpc: any;
    agent: any;
  }
}

export async function initModules() {
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
      redirect_uri: `${APP_URL}/protected/bsky`,
    },
  });

  return {
    XRPC,
    OAuthUserAgent,
    configureOAuth,
    createAuthorizationUrl,
    finalizeAuthorization,
    getSession,
    resolveFromIdentity,
  };
}

const APP_URL = "https://isx9y9-ip-136-24-64-186.tunnelmole.net";
