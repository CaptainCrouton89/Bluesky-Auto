import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const miniModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

export { miniModel, model };
