import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import Vapi from "@vapi-ai/web";
import { Mic } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardTitle } from "./ui/card";

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
    server: {
        url: "https://jovial-quail-361.convex.site/hubs/vapi",
        headers: {
            Authorization: "Bearer 3b4a405c056b715e90d6413631222170",
        },
    },
};

type VapiCallButtonProps = {
    apiKey: string;
    hubId: string;
    hubName: string;
};

const VapiCallButton: React.FC<VapiCallButtonProps> = ({
    apiKey,
    hubId,
    hubName,
}) => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<
        Array<{ role: string; text: string }>
    >([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const vapiInstance = new Vapi(apiKey);
        setVapi(vapiInstance);

        // Event listeners
        vapiInstance.on("call-start", () => {
            setIsConnected(true);
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsSpeaking(false);
            setShowModal(false);
            setTranscript([]);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });

        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });

        vapiInstance.on("message", (message) => {
            if (message.type === "transcript") {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role,
                        text: message.transcript,
                    },
                ]);
            }
        });

        vapiInstance.on("error", () => {
            // Handle errors if needed
        });

        return () => {
            vapiInstance?.stop();
        };
    }, [apiKey]);

    const startCall = () => {
        if (vapi) {
            vapi.start({
                model: {
                    provider: "openrouter",
                    model: "openai/gpt-4.1-mini",
                    tools: [getFilesTool],
                    messages: [
                        {
                            role: "system",
                            content: ASSISTANT_SYSTEM_PROMPT(hubId, hubName),
                        },
                    ],
                },
            });
            setShowModal(true);
        }
    };

    const endCall = () => {
        if (vapi) {
            vapi.stop();
        }
    };

    return (
        <>
            <Tooltip content="Talk with your hub">
                <Button
                    isDisabled={isConnected}
                    isIconOnly
                    onPress={startCall}
                    radius="sm"
                    size="sm"
                    variant="faded"
                >
                    <Mic className="h-4 w-4" />
                </Button>
            </Tooltip>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Card className="w-96 rounded-xl border border-gray-200 p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-gray-200 border-b pb-3">
                            <div>
                                <CardTitle className="font-bold text-lg">
                                    Voice Call
                                </CardTitle>
                                {hubName && (
                                    <p className="text-sm text-zinc-500">
                                        {hubName}
                                    </p>
                                )}
                            </div>
                            <Chip
                                color={isSpeaking ? "danger" : "success"}
                                variant="shadow"
                            >
                                {isSpeaking ? "Speaking" : "Listening"}
                            </Chip>
                        </div>

                        <div className="mb-4 max-h-64 overflow-y-auto rounded-lg bg-zinc-460 p-3">
                            {transcript.length === 0 ? (
                                <p className="m-0 text-center text-sm text-zinc-500">
                                    Conversation will appear here...
                                </p>
                            ) : (
                                <div
                                    className={`mb-2 ${transcript.at(-1)?.role === "user" ? "text-right" : "text-left"}`}
                                >
                                    <span
                                        className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                                            transcript.at(-1)?.role === "user"
                                                ? "bg-teal-600 text-white"
                                                : "bg-gray-800 text-white"
                                        }`}
                                    >
                                        {transcript.at(-1)?.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            className="w-full cursor-pointer rounded-lg border-none bg-red-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                            onClick={endCall}
                            type="button"
                        >
                            End Call
                        </button>
                    </Card>
                </div>
            )}
        </>
    );
};

export default VapiCallButton;
