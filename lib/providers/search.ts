import { z } from "zod";
const responseSchema=z.object({results:z.array(z.object({
 title:z.string().default("Untitled"),url:z.string().url(),content:z.string().default(""),published_date:z.string().optional()
})).default([])});
export type SearchResult={title:string;url:string;snippet:string;publishedAt?:string};
export async function webSearch(query:string):Promise<SearchResult[]> {
 const key=process.env.TAVILY_API_KEY;
 if(!key) throw new Error("TAVILY_API_KEY is not configured. Add a Tavily API key to enable web research.");
 const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),12000);
 try {
  const response=await fetch("https://api.tavily.com/search",{method:"POST",headers:{"content-type":"application/json"},
   body:JSON.stringify({api_key:key,query,search_depth:"basic",max_results:5,include_answer:false,include_raw_content:false}),
   signal:controller.signal,cache:"no-store"});
  if(!response.ok) throw new Error("Search provider returned HTTP "+response.status+".");
  const payload=responseSchema.parse(await response.json());
  return payload.results.map(item=>({title:item.title,url:item.url,snippet:item.content,publishedAt:item.published_date}));
 } finally {clearTimeout(timer);}
}
