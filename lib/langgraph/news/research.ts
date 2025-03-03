import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const tool = new TavilySearchResults({
  maxResults: 5,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  new MessagesPlaceholder("messages"),
]);

const llmWithTools = model.bindTools([tool]);

const chain = prompt.pipe(llmWithTools);

export const newsChain = RunnableLambda.from(
  async (userInput: string, config) => {
    const humanMessage = new HumanMessage(userInput);
    const aiMsg = await chain.invoke(
      {
        messages: [humanMessage],
      },
      config || {}
    );
    const toolMsgs = await tool.batch(aiMsg.tool_calls || [], config);
    return chain.invoke(
      {
        messages: [humanMessage, aiMsg, ...toolMsgs],
      },
      config
    );
  }
);
