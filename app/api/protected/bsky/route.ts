import { postText } from "@/lib/bsky";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await postText("hey");
    console.log(result);
    return NextResponse.json(
      { message: "Text posted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to post text" }, { status: 500 });
  }
}
