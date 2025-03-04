import { miniModel } from "@/lib/model";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You will be given a list of news articles, and you should return just the URL of the most interesting one. Choose the AP news, CNN, or ABC if possible. Return the URL only, with no other text.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const mostSensationalNewsChain = prompt.pipe(miniModel);

export { mostSensationalNewsChain };
