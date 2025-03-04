import { findHashtags, postText } from "@/lib/bsky/bsky";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text } = await request.json();

  const facets = findHashtags(text);

  const result = await postText(text, facets);

  return NextResponse.json({
    message: "Post created successfully",
    result,
  });
}
