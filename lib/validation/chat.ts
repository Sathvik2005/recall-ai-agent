import { z } from "zod";
export const chatRequestSchema=z.object({
 message:z.string().trim().min(1).max(8000),
 conversationId:z.string().uuid().optional(),
 timeZone:z.string().min(1).max(64).optional()
});
export type ChatRequest=z.infer<typeof chatRequestSchema>;
