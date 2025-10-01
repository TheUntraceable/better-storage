import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import Scorecard from "scorecard-ai";

const openRouter = createOpenAICompatible({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    name: "OpenRouter",
});
const ASSISTANT_SYSTEM_PROMPT = (
    hubId: string,
    hubName: string
) => `You are a helpful assistant that manages files within the user's hub (${hubName}).

Key responsibilities:
- Help users organize, search, and navigate their files
- Use the get_file_names function to retrieve available files before making recommendations
- Provide clear, actionable guidance for file operations

Context:
- Current hub: ${hubName}
- Hub ID: ${hubId} (reference this internally but don't mention it to users)

Guidelines:
- Be proactive: fetch file listings when users ask vague questions like "what files do I have?"
- Use natural language: refer to "${hubName}" rather than technical identifiers
- Confirm actions: before performing destructive operations, summarize what will happen
- Handle errors gracefully: if files aren't found, suggest alternatives or help users search

Respond conversationally and focus on helping users accomplish their file management goals efficiently.`;

const client = new Scorecard({
    apiKey: process.env.SCORECARD_API_KEY!,
});

type SystemInputs = {
    hubId: string;
    hubName: string;
    userQuery: string;
};

type ToolCall = {
    name: string;
    arguments: Record<string, any>;
};

type SystemOutput = {
    answer: string;
    tool_calls: ToolCall[];
};

const getFilesTool = {
    type: "function" as const,
    function: {
        name: "get_file_names",
        description: "Get the names of the files a user has.",
        parameters: {
            type: "object" as const,
            properties: {
                hubId: {
                    description: "The ID of the hub the user wants to access.",
                    type: "string" as const,
                },
            },
            required: ["hubId"],
        },
    },
    // Add inputSchema to satisfy the provider Tool typing requirements
    inputSchema: {
        type: "object" as const,
        properties: {
            hubId: {
                description: "The ID of the hub the user wants to access.",
                type: "string" as const,
            },
        },
        required: ["hubId"],
    },
    server: {
        url: "https://shocking-marlin-643.convex.site/hubs/vapi",
        headers: {
            Authorization: `Bearer ${process.env.INKEEP_SECRET}`,
        },
    },
};

export async function runMyAISystem(
    inputs: SystemInputs
): Promise<SystemOutput> {
    const { hubId, userQuery, hubName } = inputs;
    const { text, toolCalls } = await generateText({
        model: openRouter("openai/gpt-oss-120b"),
        messages: [
            {
                role: "system",
                content: ASSISTANT_SYSTEM_PROMPT(hubId, hubName),
            },
            {
                role: "user",
                content: userQuery,
            },
        ],
        tools: [getFilesTool],
    });
    const formattedToolCalls: ToolCall[] = [];
    for (const call of toolCalls) {
        formattedToolCalls.push({ name: call.toolName, arguments: call.input });
    }
    return {
        answer: text,
        tool_calls: formattedToolCalls,
    };
}
