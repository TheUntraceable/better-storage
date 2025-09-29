import {
    contextConfig,
    fetchDefinition,
    requestContextSchema,
} from "@inkeep/agents-core";
import { agent, agentGraph, project } from "@inkeep/agents-sdk";
import { z } from "zod";

const requestContext = requestContextSchema({
    schema: z.object({
        hub_id: z.string(),
    }),
});

// 2. Create the fetcher with
const hubFetcher = fetchDefinition({
    id: "hub-info",
    name: "Hub Information",
    trigger: "initialization", // Fetch only once when a conversation is started with the graph. When set to "invocation", the fetch will be executed every time a request is made to the graph.
    fetchConfig: {
        url: `https://${process.env.SITE_URL}/hubs/${requestContext.toTemplate("hub_id")}`,
        method: "GET",
        headers: {
            Authorization: `Bearer ${process.env.INKEEP_SECRET}`,
        },
    },
    responseSchema: z.string(), // Used to validate the result of the transformed api response.
    defaultValue: "Unable to fetch hub information",
});

// 3. Configure context
const hubContext = contextConfig({
    tenantId: "default",
    id: "hub-context",
    name: "hub Context",
    description: "Fetches hub information for better info on their files.",
    requestContextSchema: requestContext,
    contextVariables: {
        hubData: hubFetcher,
    },
});

// 4. Create and use the agent
const personalAgent = agent({
    id: "docki",
    name: "Docki",
    description: "This agent will help you with questions about your files.",
    prompt: `Hello! I'm your personal assistant.`,
});

// Initialize the graph
export const graph = agentGraph({
    id: "9dgX7mA72bqeepxx6LU_N",
    name: "Personal Assistant Graph",
    defaultAgent: personalAgent,
    agents: () => [personalAgent],
    contextConfig: hubContext,
});

export const myProject = project({
    id: "better-storage-assistant",
    name: "Better Storage Assistant",
    description: "An assistant to help you manage your files.",
    graphs: () => [graph],
})