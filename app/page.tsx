"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h1 className="text-4xl font-bold">
          The best news commentary on the internet
        </h1>
        <Button onClick={() => router.push("/protected/dashboard")}>
          Get started
        </Button>
      </main>
    </>
  );
}
