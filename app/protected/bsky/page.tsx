import PostTextButton from "@/components/PostText";

export default async function BskyPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">DnD Meme Generator</h1>
        <p className="text-gray-600">
          Click the button below to post "hey" to bsky.
        </p>
        <PostTextButton />
      </div>
    </div>
  );
}
