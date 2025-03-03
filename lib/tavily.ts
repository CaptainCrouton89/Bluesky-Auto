// To install: npm i @tavily/core
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { tavily } from "@tavily/core";
const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export async function searchNews(query: string) {
  const result = await client.search(query, {
    topic: "news",
    searchDepth: "advanced",
    maxResults: 5,
    timeRange: "day",
  });
  return result;
}

export const newsTools = [
  new TavilySearchResults({
    maxResults: 5,
  }),
];

import { tool } from "@langchain/core/tools";
import { z } from "zod";

const extractSchema = z.object({
  url: z.string(),
});

export const extractContentTool = tool(
  async (input: { url: string }): Promise<string> => {
    const response = await client.extract([input.url], {});
    return response.results[0].rawContent;
  },
  {
    name: "extract",
    description: "Extracts the content of a website when given a url",
    schema: extractSchema,
  }
);
