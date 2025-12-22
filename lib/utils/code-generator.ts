// lib/code-generator.ts

import { FlowNode, AgentStep } from "@/types/call-flow-types";

// Helper to make ID safe for Python function names (node-123 -> node_123)
const cleanId = (id: string) => id.replace(/-/g, "_");

export function generatePythonScript(rootNode: FlowNode): string {
  let script = [];

  // --- 1. IMPORTS & SETUP ---
  script.push(`import asyncio`);
  script.push(`import aiohttp`);
  script.push(`from livekit import agents, rtc`);
  script.push(`from livekit.agents import JobContext, JobRequest, WorkerOptions, cli`);
  script.push(`from livekit.plugins import openai, deepgram, silero`);
  script.push(``);
  script.push(`# --- KNOWLEDGE BASE (Injected from Context) ---`);
  script.push(`CONTEXT_DATA = {`);
  script.push(`    "Business Hours": "Mon-Fri 8am-6pm",`);
  script.push(`    "Pricing Base": "$350 per room",`);
  script.push(`    "Support Phone": "555-0199"`);
  script.push(`}`);
  script.push(``);

  // --- 2. NODE FUNCTIONS ---
  // We traverse the tree and create a function for EVERY node
  function traverse(node: FlowNode) {
    const fnName = cleanId(node.id);
    
    script.push(`async def ${fnName}(ctx: JobContext, agent):`);
    script.push(`    print(f"Entering Node: ${node.title}")`);

    // A. HANDLE AGENT ACTIONS
    if (node.type === "action") {
      // 1. Inject Context
      if (node.contextKeys && node.contextKeys.length > 0) {
        script.push(`    # Injecting Context`);
        node.contextKeys.forEach(key => {
            script.push(`    await agent.say(f"Note: {CONTEXT_DATA.get('${key}')}")`);
        });
      }

      // 2. Run Steps (Pills)
      if (node.steps && node.steps.length > 0) {
        node.steps.forEach(step => {
            if (step.type === 'say') {
                script.push(`    await agent.say("${step.content}")`);
            } else if (step.type === 'collect') {
                script.push(`    # Collecting Data: ${step.variable}`);
                script.push(`    user_response = await agent.collect("${step.content}")`);
                script.push(`    ctx.user_data['${step.variable}'] = user_response`);
            } else if (step.type === 'execute') {
                script.push(`    # Executing Function`);
                script.push(`    await execute_function("${step.content}")`);
            }
        });
      }
    }

    // B. HANDLE API CALLS
    else if (node.type === "api") {
      const method = node.title.includes("POST") ? "post" : "get";
      // This is a rough heuristic, in real app we'd save URL in content
      const url = "https://api.hue-line.com/webhook"; 
      
      script.push(`    async with aiohttp.ClientSession() as session:`);
      script.push(`        async with session.${method}("${url}") as resp:`);
      script.push(`            result = await resp.json()`);
      script.push(`            print(f"API Result: {result}")`);
    }

    // C. HANDLE LOGIC / TRANSITIONS
    if (node.children.length === 0) {
      if (node.type === 'end') {
          script.push(`    print("Ending Call")`);
          script.push(`    ctx.room.disconnect()`);
      } else {
          script.push(`    # End of branch`);
      }
    } else if (node.children.length === 1) {
      // Direct Flow
      const child = node.children[0];
      script.push(`    await ${cleanId(child.id)}(ctx, agent)`);
    } else {
      // Branching Logic
      script.push(`    # Decision Logic: ${node.content}`);
      script.push(`    # In a real agent, this would analyze 'user_response' or 'result'`);
      
      node.children.forEach((child, index) => {
        const keyword = child.label || "default";
        if (index === 0) {
            script.push(`    if "${keyword.toLowerCase()}" in last_input:`);
            script.push(`        await ${cleanId(child.id)}(ctx, agent)`);
        } else {
            script.push(`    elif "${keyword.toLowerCase()}" in last_input:`);
            script.push(`        await ${cleanId(child.id)}(ctx, agent)`);
        }
      });
    }
    script.push(``);

    // Recursively process children definition
    node.children.forEach(child => traverse(child));
  }

  // Start processing from root
  traverse(rootNode);

  // --- 3. ENTRY POINT ---
  script.push(`async def entrypoint(ctx: JobContext):`);
  script.push(`    await ctx.connect()`);
  script.push(`    agent = agents.VoicePipelineAgent(`);
  script.push(`        vad=silero.VAD.load(),`);
  script.push(`        stt=deepgram.STT(),`);
  script.push(`        llm=openai.LLM(),`);
  script.push(`        tts=openai.TTS()`);
  script.push(`    )`);
  script.push(`    agent.start(ctx.room)`);
  script.push(``);
  script.push(`    # Start the Flow Tree`);
  script.push(`    await ${cleanId(rootNode.id)}(ctx, agent)`);
  script.push(``);
  script.push(`if __name__ == "__main__":`);
  script.push(`    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))`);

  return script.join("\n");
}