import { CompiledStateGraph } from "@langchain/langgraph";

export const showRepresentation = async (
  graph: CompiledStateGraph<any, any, any, any, any>
) => {
  const representation = await graph.getGraphAsync();
  console.log(representation);
};
