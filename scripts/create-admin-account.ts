/** biome-ignore-all lint/suspicious/noConsole: Console logs in CLI tools are acceptable */

import { ConvexClient } from "convex/browser";
import prompts from "prompts";
import { z } from "zod";
import { api } from "@/convex/_generated/api";

const MIN_PASSWORD_LENGTH = 6;

const registerSchema = z
    .object({
        email: z.email("Please enter a valid email address"),
        name: z.string().min(1, "Name is required"),
        password: z
            .string()
            .min(
                MIN_PASSWORD_LENGTH,
                `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

async function createAdminAccount(): Promise<void> {
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
        console.error(
            "Error: NEXT_PUBLIC_CONVEX_URL environment variable is required"
        );
        process.exit(1);
    }

    if (!process.env.ADMIN_CREATION_SECRET) {
        console.error(
            "Error: ADMIN_CREATION_SECRET environment variable is required"
        );
        process.exit(1);
    }

    const response = await prompts(
        [
            {
                type: "text",
                name: "email",
                message: "Enter admin email:",
                validate: (value: string) =>
                    value.includes("@") || "Please enter a valid email",
            },
            {
                type: "text",
                name: "name",
                message: "Enter admin name:",
                validate: (value: string) =>
                    value.trim().length > 0 || "Name cannot be empty",
            },
            {
                type: "password",
                name: "password",
                message: `Enter admin password (min ${MIN_PASSWORD_LENGTH} characters):`,
                validate: (value: string) =>
                    value.length >= MIN_PASSWORD_LENGTH ||
                    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
            },
            {
                type: "password",
                name: "confirmPassword",
                message: "Confirm admin password:",
            },
        ],
        {
            onCancel: () => {
                console.log("Admin creation cancelled.");
                process.exit(0);
            },
        }
    );

    // Validate the input data
    const parsed = registerSchema.safeParse(response);
    if (!parsed.success) {
        console.error("Validation errors:");
        for (const error of parsed.error.issues) {
            console.error(`  - ${error.message}`);
        }
        process.exit(1);
    }

    try {
        const convexClient = new ConvexClient(
            process.env.NEXT_PUBLIC_CONVEX_URL
        );

        console.log("Creating admin account...");
        const createUserResponse = await convexClient.mutation(
            api.auth.createAdmin,
            {
                email: parsed.data.email,
                password: parsed.data.password,
                name: parsed.data.name,
                secret: process.env.ADMIN_CREATION_SECRET,
            }
        );

        if (createUserResponse?.user) {
            console.log(
                `✅ Admin user created successfully: ${createUserResponse.user.email}`
            );
            process.exit(0);
        } else {
            console.error(
                "❌ Failed to create admin user: No user returned from mutation"
            );
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ Failed to create admin user:");
        if (error instanceof Error) {
            console.error(`  ${error.message}`);
        } else {
            console.error("  An unexpected error occurred");
        }
        process.exit(1);
    }
}

// Run the script
createAdminAccount().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
