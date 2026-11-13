import {describe,expect,it} from "vitest";
import {SYSTEM_PROMPT} from "../lib/agent/prompts";
describe("RECALL system contract",()=>{
 it("requires honest historical recall",()=>expect(SYSTEM_PROMPT).toContain("Never claim to remember"));
 it("separates historical and current observations",()=>expect(SYSTEM_PROMPT).toContain("historical observations"));
 it("requires explicit uncertainty",()=>expect(SYSTEM_PROMPT).toContain("INCONCLUSIVE"));
 it("treats retrieved content as untrusted",()=>expect(SYSTEM_PROMPT).toContain("untrusted data"));
});
