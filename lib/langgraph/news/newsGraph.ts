import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { commentGenerationChain } from "./generation";
import { mostSensationalNewsChain } from "./mostSensational";
import { readArticleChain } from "./readArticle";
import { reflectionChain } from "./reflection";
import { newsChain } from "./research";

// Define the top-level State interface
const State = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

export async function getSocialMediaPostWorkflow(researchTopic: string) {
  const researchNode = async (state: typeof State.State) => {
    // const { messages } = state;
    return {
      messages: [await newsChain.invoke(researchTopic)],
    };
  };

  const mostSensationalNewsNode = async (state: typeof State.State) => {
    const { messages } = state;
    return {
      messages: [await mostSensationalNewsChain.invoke({ messages })],
    };
  };

  const generationNode = async (state: typeof State.State) => {
    const { messages } = state;
    return {
      messages: [await commentGenerationChain.invoke({ messages })],
    };
  };

  const reflectionNode = async (state: typeof State.State) => {
    const { messages } = state;
    // Other messages we need to adjust
    const clsMap: { [key: string]: new (content: string) => BaseMessage } = {
      ai: HumanMessage,
      human: AIMessage,
    };
    // First message is the original user request. We hold it the same for all nodes
    const translated = [
      messages[0],
      ...messages
        .slice(1)
        .map((msg) => new clsMap[msg._getType()](msg.content.toString())),
    ];
    const res = await reflectionChain.invoke({ messages: translated });
    // We treat the output of this as human feedback for the generator
    return {
      messages: [new HumanMessage({ content: res.content })],
    };
  };

  const readArticleNode = async (state: typeof State.State) => {
    const { messages } = state;
    return {
      messages: [
        await readArticleChain.invoke(
          messages[messages.length - 1].content.toString()
        ),
      ],
    };
  };
  // Define the graph
  const workflow = new StateGraph(State)
    .addNode("research", researchNode)
    .addNode("mostSensational", mostSensationalNewsNode)
    .addNode("generate", generationNode)
    // .addNode("reflect", reflectionNode)
    .addNode("readArticle", readArticleNode);

  const shouldContinue = (state: typeof State.State) => {
    const { messages } = state;
    if (messages.length > 8) {
      return "end";
    }
    return "reflect";
  };

  workflow
    .addEdge(START, "research")
    .addEdge("research", "mostSensational")
    .addEdge("mostSensational", "readArticle")
    .addEdge("readArticle", "generate")
    .addEdge("generate", END);
  // .addEdge("reflect", "generate")
  // .addConditionalEdges("generate", shouldContinue, {
  //   end: END,
  //   reflect: "reflect",
  // });

  return workflow;
}
