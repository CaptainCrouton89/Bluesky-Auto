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
    const { text, tone } = await request.json();

    const checkpointConfig = { configurable: { thread_id: "my-thread" } };

    const workflow = await getSocialMediaPostWorkflow(text);

    const newsGraph = workflow.compile({ checkpointer: new MemorySaver() });

    showRepresentation(newsGraph);

    const stream = await newsGraph.stream(
      {
        messages: [
          new HumanMessage({
            content: `Generate a ${tone} comment on the article that could be posted to bluesky. The comment should be no more than 280 characters.`,
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

    return NextResponse.json(
      {
        message: "Post generated successfully",
        result: post,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to post text" }, { status: 500 });
  }
}
