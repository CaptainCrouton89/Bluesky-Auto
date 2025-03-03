import PostTextButton from "@/components/PostText";
import { Button } from "@/components/ui/button";
import { bskyLogin } from "@/lib/bsky/oauth";

export default async function BskyPage() {
  const handleBskyLogin = async () => {
    await bskyLogin();
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex flex-col gap-6">
        <Button
          onClick={handleBskyLogin}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          Login with Bluesky
        </Button>
        <h1 className="text-2xl font-bold">DnD Meme Generator</h1>
        <p className="text-gray-600">
          Click the button below to post "hey" to bsky.
        </p>
        <PostTextButton />
      </div>
    </div>
  );
}
