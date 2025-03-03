"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFollowersWithXRPC,
  getProfileWithXRPC,
  postTextWithXRPC,
} from "@/lib/bsky/client";
import { useBlueskyAuth } from "@/lib/bsky/oauth";
import { useEffect, useRef, useState } from "react";

export default function BskyPage() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const { login, isLoggedIn, agent, isLoading, xrpc, logout, getFollowers } =
    useBlueskyAuth(usernameRef);
  const [followers, setFollowers] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && agent) {
      console.log("Logged in");
      console.log(agent.session.info.sub);
      setError(null);
    }
  }, [isLoggedIn, agent]);

  useEffect(() => {
    if (xrpc) {
      console.log("XRPC", xrpc);
      setError(null);

      // Get followers using our new client function
      const fetchFollowers = async () => {
        try {
          const followersData = await getFollowersWithXRPC(xrpc);
          setFollowers(followersData || []);
        } catch (error) {
          console.error("Error fetching followers:", error);
          setError("Failed to fetch followers. Please try again.");
        }
      };

      // Get profile using our new client function
      const fetchProfile = async () => {
        try {
          const profileData = await getProfileWithXRPC(xrpc);
          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setError("Failed to fetch profile. Please try again.");
        }
      };

      fetchFollowers();
      fetchProfile();
    }
  }, [xrpc]);

  // Function to post text using our client-side implementation
  const handlePostText = async () => {
    if (!textRef.current?.value || !xrpc) return;

    setIsPosting(true);
    setError(null);
    try {
      const result = await postTextWithXRPC(xrpc, textRef.current.value);
      console.log("Post result:", result);
      // Clear the input after posting
      if (textRef.current) {
        textRef.current.value = "";
      }
    } catch (error) {
      console.error("Error posting:", error);
      setError("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex flex-col gap-6">
        {!isLoggedIn ? (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Username"
              ref={usernameRef}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            />
            <Button
              onClick={() => login()}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login with Bluesky"}
            </Button>
          </div>
        ) : (
          <>
            {profile && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {profile.displayName || profile.handle}
                </h2>
                <p className="text-gray-600">@{profile.handle}</p>
              </div>
            )}

            <Button onClick={() => logout()}>Logout</Button>
            <h1 className="text-2xl font-bold">Post to Bluesky</h1>
            <Input
              placeholder="Text to post"
              ref={textRef}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            />
            <Button
              onClick={handlePostText}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
              disabled={isPosting}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>

            {followers.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Followers</h2>
                <ul className="space-y-2">
                  {followers.map((follower, index) => (
                    <li key={index} className="p-2 bg-gray-100 rounded">
                      {follower.displayName || follower.handle}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
