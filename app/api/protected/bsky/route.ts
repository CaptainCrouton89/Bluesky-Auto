import { findHashtags, postText } from "@/lib/bsky/bsky";
import { getSocialMediaPostWorkflow } from "@/lib/langgraph/news/newsGraph";
import { showRepresentation } from "@/lib/langgraph/utils";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // const news = await searchNews("Trump");

    // const allNews = news.results
    //   .map((result) => {
    //     return `${result.title}\n${result.url}\n`;
    //   })
    //   .join("\n");

    // console.log(allNews);
    const { text } = await request.json();

    const checkpointConfig = { configurable: { thread_id: "my-thread" } };

    const workflow = await getSocialMediaPostWorkflow(text);

    const newsGraph = workflow.compile({ checkpointer: new MemorySaver() });

    showRepresentation(newsGraph);

    const stream = await newsGraph.stream(
      {
        messages: [
          new HumanMessage({
            content:
              "Generate a snarky comment on the news that could be posted to bluesky. The comment should be no more than 280 characters.",
          }),
        ],
      },
      checkpointConfig
    );

    for await (const event of stream) {
      for (const [key, value] of Object.entries(event)) {
        console.log(`Event: ${key}`);
        const content = value as any;
        console.log(content.messages[content.messages.length - 1].content);
        console.log("\n------\n");
      }
    }

    const snapshot = await newsGraph.getState(checkpointConfig);
    console.log(
      snapshot.values.messages
        .map((msg: BaseMessage) => msg.content)
        .join("\n\n\n------------------\n\n\n")
    );

    const post =
      snapshot.values.messages[snapshot.values.messages.length - 1].content;

    // Find all hashtags in the post and create facets for them
    const facets = findHashtags(post);

    const result = await postText(post, facets);
    return NextResponse.json(
      {
        message: "Text posted successfully",
        result: post,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to post text" }, { status: 500 });
  }
}
