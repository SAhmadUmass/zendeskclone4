import { LangChainTracer } from "langchain/callbacks"

let tracer: LangChainTracer | null = null

export function getTracer() {
  if (!tracer) {
    tracer = new LangChainTracer({
      projectName: process.env.LANGSMITH_PROJECT || "default",
    })
  }
  return tracer
} 