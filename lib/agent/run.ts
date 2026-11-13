import { generateText,tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { webSearch,type SearchResult } from "@/lib/providers/search";
import { SYSTEM_PROMPT } from "./prompts";
export type ChatTurn={role:"user"|"assistant";content:string};
export type AgentResult={text:string;sources:SearchResult[];searched:boolean};
export async function runAgent(message:string,history:ChatTurn[],memoryContext=""):Promise<AgentResult> {
 if(!process.env.OPENAI_API_KEY)throw new Error("OPENAI_API_KEY is not configured. Add an OpenAI API key to enable RECALL.");
 const openai=createOpenAI({apiKey:process.env.OPENAI_API_KEY});
 const sources:SearchResult[]=[];let searchCount=0;
 const system=memoryContext?SYSTEM_PROMPT+"\\n\\nRETRIEVED CROSS-CONVERSATION MEMORY (timestamped; use only when relevant):\\n"+memoryContext:SYSTEM_PROMPT;
 const result=await generateText({
  model:openai(process.env.OPENAI_MODEL||"gpt-4.1-mini"),system,
  messages:[...history.slice(-16).map(turn=>({role:turn.role,content:turn.content})),{role:"user",content:message}],
  maxSteps:4,temperature:0.2,
  tools:{web_search:tool({
   description:"Search the public web for current, verifiable information. Use for recent facts, prices, product updates, and temporal comparisons. At most three calls per turn.",
   parameters:z.object({query:z.string().min(3).max(300)}),
   execute:async({query})=>{
    if(searchCount>=3)return {error:"Search budget reached. Explain remaining uncertainty."};
    searchCount++;const results=await webSearch(query);const start=sources.length;sources.push(...results);
    return results.map((item,index)=>({citation:start+index+1,title:item.title,url:item.url,snippet:item.snippet,publishedAt:item.publishedAt??null}));
   }
  })}
 });
 return {text:result.text,sources,searched:searchCount>0};
}
