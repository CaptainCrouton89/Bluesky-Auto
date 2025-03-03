import { model } from "@/lib/model";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const reflectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You represent a panel judging the quality of a news commentator. Provide any critiques of the commentator's work, and keep it concise.`,
  ],
  new MessagesPlaceholder("messages"),
]);
export const reflectionChain = reflectionPrompt.pipe(model);
