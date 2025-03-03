"use client";
import PostTextButton from "@/components/PostText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlueskyAuth } from "@/lib/bsky/oauth";
import { useRef } from "react";

export default function BskyPage() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const { login, follows, isLoggedIn, agent } = useBlueskyAuth(usernameRef);

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex flex-col gap-6">
        <Input
          placeholder="Username"
          ref={usernameRef}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        />
        {isLoggedIn ? (
          <Button
            onClick={() => login()}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Login with Bluesky
          </Button>
        ) : (
          <>
            <h1 className="text-2xl font-bold">DnD Meme Generator</h1>
            <p className="text-gray-600">
              Click the button below to post "hey" to bsky.
            </p>
            <PostTextButton />
          </>
        )}
        <div className="flex flex-col gap-2">
          {follows.map((follow) => (
            <div key={follow.handle}>{follow.handle}</div>
          ))}
          <Button onClick={() => console.log(follows)}>Log follows</Button>
        </div>
      </div>
    </div>
  );
}
