"use client";

import { postTextAction } from "@/lib/actions/dashboard";
import { Button } from "./ui/button";

export default function PostTextButton() {
  return <Button onClick={() => postTextAction("Hey")}>Post Hey</Button>;
}
