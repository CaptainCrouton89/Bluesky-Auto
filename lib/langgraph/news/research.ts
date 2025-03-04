import { HumanMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const searchTool = new TavilySearchResults({
  maxResults: 5,
});

export const newsChain = RunnableLambda.from(
  async (userInput: string, config) => {
    try {
      const toolResponse = await searchTool.invoke(userInput);

      if (!toolResponse) {
        console.error("searchTool did not return content:", toolResponse);
        throw new Error("Failed to fetch search results.");
      }

      return new HumanMessage(
        `Here are the search results:\n\n${toolResponse}`
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
      return "Failed to fetch the search results. Please try again.";
    }
  }
);
