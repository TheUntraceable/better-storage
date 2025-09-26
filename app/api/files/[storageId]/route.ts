import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    { params }: { params: { storageId: string } }
) {
    try {
        const { storageId } = params;

        // Create the Convex storage URL directly
        const baseUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace("/api", "");
        const fileUrl = `${baseUrl}/api/storage/${storageId}`;

        // Redirect to the actual file URL
        return NextResponse.redirect(fileUrl);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
