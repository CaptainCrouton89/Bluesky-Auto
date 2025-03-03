"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postTextAction } from "@/lib/actions/dashboard";
import { getFollowers } from "@/lib/bsky/bsky";
import { useBlueskyAuth } from "@/lib/bsky/oauth";
import { useEffect, useRef } from "react";

export default function BskyPage() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const { login, isLoggedIn, agent, isLoading } = useBlueskyAuth(usernameRef);

  useEffect(() => {
    if (isLoggedIn) {
      console.log("Logged in");
      console.log(agent.session.info.sub);
    }
  }, [isLoggedIn]);

  console.log(agent);

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex flex-col gap-6">
        {isLoading || !agent ? (
          <div className="flex justify-center items-center">
            <div className="loader"></div>
            <style jsx>{`
              .loader {
                border: 8px solid rgba(255, 255, 255, 0.3);
                border-left: 8px solid #ffffff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
              }

              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Username"
              ref={usernameRef}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            />
            <Button
              onClick={() => login()}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
              Login with Bluesky
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Bluesky Bot</h1>
            <Input
              placeholder="Text to post"
              ref={textRef}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            />
            <Button
              onClick={() => postTextAction(textRef.current?.value || "")}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
              Post
            </Button>
            <Button
              onClick={() =>
                getFollowers(agent.session.info.sub, agent.session.token.access)
              }
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
              Get Followers
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
