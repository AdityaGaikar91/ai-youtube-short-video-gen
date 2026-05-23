import { inngest } from "@/inngest/client";
import { GenerateVideoData, helloWorld, RefreshExpiringTokens, ProcessRecurringSchedules, ExecuteScheduledUpload } from "@/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    GenerateVideoData,
    RefreshExpiringTokens,
    ProcessRecurringSchedules,
    ExecuteScheduledUpload,
  ],
});