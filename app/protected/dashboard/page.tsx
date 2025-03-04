"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface IDashboardProps {}

export default function Dashboard(props: IDashboardProps) {
  const textRef = useRef<HTMLInputElement>(null);
  const toneRef = useRef<HTMLInputElement>(null);
  const [postContent, setPostContent] = useState<string | null>(null);

  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  const draftPost = useCallback(async () => {
    if (textRef.current) {
      setLoadingDraft(true);
      const text = textRef.current.value;
      const tone = toneRef.current?.value;
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
  }, []);

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
    <div className="flex flex-col items-center justify-center">
      <Input placeholder="Post tone" ref={toneRef} className="mb-4" />
      <Input placeholder="Post topic" ref={textRef} className="mb-4" />
      <Button
        disabled={loadingDraft || !textRef.current?.value}
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
      <div className="mt-4 p-4 border border-gray-300 rounded-lg shadow-md bg-white w-96">
        <p className="text-gray-800">{postContent}</p>
      </div>
    </div>
  );
}
