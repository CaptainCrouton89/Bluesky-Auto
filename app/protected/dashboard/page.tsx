"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export interface IDashboardProps {}

export default function Dashboard(props: IDashboardProps) {
  const [text, setText] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [postContent, setPostContent] = useState<string | null>(null);

  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  const draftPost = useCallback(async () => {
    if (text) {
      setLoadingDraft(true);
      try {
        const response = await api.post("/api/protected/ai", { text, tone });
        toast.success(response.data.message);
        setPostContent(response.data.result);
      } catch (error) {
        toast.error("Failed to draft post");
      } finally {
        setLoadingDraft(false);
      }
    }
  }, [text, tone]);

  const postOnSubject = useCallback(async () => {
    if (postContent) {
      setLoadingPost(true);
      try {
        const response = await api.post("/api/protected/bsky", {
          text: postContent,
        });
        toast.success(response.data.message);
        setPostContent(null);
      } catch (error) {
        toast.error("Failed to post on subject");
      } finally {
        setLoadingPost(false);
      }
    }
  }, [postContent]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Input
        placeholder="Post tone"
        value={tone}
        onChange={(e) => setTone(e.target.value.toLowerCase())}
        className="mb-4"
      />
      <Input
        placeholder="Post topic"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-4"
      />
      <Button
        disabled={loadingDraft || !text}
        onClick={draftPost}
        className="mt-4 w-full bg-blue-500 text-white hover:bg-blue-600"
      >
        {loadingDraft ? "Generating..." : "Draft"}
      </Button>
      <Button
        disabled={loadingPost || !postContent}
        onClick={postOnSubject}
        className="mt-4 w-full bg-green-500 text-white hover:bg-green-600"
      >
        {loadingPost ? "Posting..." : "Post"}
      </Button>
      {postContent && (
        <div className="mt-4 p-4 border border-gray-300 rounded-lg shadow-md bg-white w-full">
          <p className="text-gray-800">{postContent}</p>
        </div>
      )}
    </div>
  );
}
