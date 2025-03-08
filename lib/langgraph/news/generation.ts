import { miniModel } from "@/lib/model";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a social media writer, writing the most viral comment on the given article. The date is ${new Date().toLocaleDateString()}. Use hashtags, and be very creative.
    
    If you are given criticism, use it to improve your comment.`,
  ],
  new MessagesPlaceholder("messages"),
]);

const commentGenerationChain = prompt.pipe(miniModel);

export { commentGenerationChain };
