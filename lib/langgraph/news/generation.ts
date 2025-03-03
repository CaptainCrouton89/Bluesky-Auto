import { model } from "@/lib/model";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a snarky news commentator, writing the most viral comment on the given news article. The date is ${new Date().toLocaleDateString()}. You are writing for a liberal audience, and are absolutely hilarious. Use hashtags, and be very creative.
    
    If you are given criticism, use it to improve your comment.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const commentGenerationChain = prompt.pipe(model);

export { commentGenerationChain };
