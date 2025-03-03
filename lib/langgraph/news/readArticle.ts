import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

import { extractContentTool } from "@/lib/tavily";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Extract and return the full text of the article at the given URL.",
  ],
  new MessagesPlaceholder("messages"),
]);

const chain = prompt.pipe(model);

export const readArticleChain = RunnableLambda.from(
  async (userInput: string, config) => {
    console.log("Fetching article from URL:", userInput);

    // Ensure extractContentTool is properly called
    try {
      const toolResponse = await extractContentTool.invoke({ url: userInput });

      if (!toolResponse) {
        console.error(
          "extractContentTool did not return content:",
          toolResponse
        );
        throw new Error("Failed to fetch article content.");
      }

      console.log("Fetched article content:", toolResponse.slice(0, 500)); // Log first 200 chars

      return new HumanMessage(
        `Here is the article content:\n\n${toolResponse}`
      );
    } catch (error) {
      console.error("Error fetching article:", error);
      return "Failed to fetch the article. Please check the URL and try again.";
    }
  }
);
