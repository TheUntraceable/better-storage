import { defineConfig } from "@inkeep/agents-cli/config";

export default defineConfig({
    tenantId: "default",
    // API endpoints
    agentsManageApiUrl: "http://localhost:3002",
    agentsRunApiUrl: "http://localhost:3003",
});
