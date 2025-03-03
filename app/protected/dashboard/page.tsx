"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface IDashboardProps {}

export default function Dashboard(props: IDashboardProps) {
  const textRef = useRef<HTMLInputElement>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState<string | null>(null);

  const handlePostOnSubject = useCallback(async () => {
    if (textRef.current) {
      const text = textRef.current.value;
      const response = await api.post("/api/protected/bsky", { text });
      toast.success(response.data.message);
      setPostContent(response.data.result);
    }
  }, []);

  return (
    <div>
      <Input placeholder="Text to post" ref={textRef} />
      <Button
        onClick={handlePostOnSubject}
        className="mt-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition duration-200"
      >
        Post
      </Button>
      {postContent && <p>{postContent}</p>}
    </div>
  );
}
