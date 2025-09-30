import { VapiClient } from "@vapi-ai/server-sdk";

const vapi = new VapiClient({
    token: process.env.VAPI_API_KEY!,
});

try {
    const knowledgeBase = await vapi.files.create({
        provider: "custom-knowledge-base",
        server: {
            url: "https://your-domain.com/kb/search",
            secret: "your-webhook-secret",
        },
    });

    console.log(`Custom Knowledge Base created: ${knowledgeBase.id}`);
} catch (error) {
    console.error("Failed to create knowledge base:", error);
}
