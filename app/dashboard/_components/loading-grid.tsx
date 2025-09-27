import { Card, CardContent } from "@/components/ui/card";

export function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card className="animate-pulse" key={i}>
                    <CardContent className="p-4">
                        <div className="mb-3 aspect-square rounded-lg bg-muted" />
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 rounded bg-muted" />
                            <div className="h-3 w-1/2 rounded bg-muted" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
