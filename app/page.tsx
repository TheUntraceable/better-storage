import { Button } from "@heroui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="max-w-4xl text-center">
                <h1 className="mb-6 font-bold text-5xl tracking-tight sm:text-6xl lg:text-7xl">
                    <span className="text-primary">Better Okta</span>
                </h1>
                <p className="mtext-xl mb-2 sm:text-2xl">
                    The modern OIDC provider
                </p>
                <p className="mx-auto mb-8 max-w-2xl text-lg">
                    Finally, an identity provider that doesn't make you want to
                    cry. Beautiful UI and authentication that just works.
                </p>
                <div className="mb-12 flex flex-wrap justify-center gap-4">
                    <Button color="primary" size="lg" variant="shadow">
                        Get Started
                    </Button>
                    <Button size="lg" variant="bordered">
                        View Demo
                    </Button>
                </div>

                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Beautiful UI</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                No more 2010-era interfaces. Clean, modern
                                design that your users will actually enjoy.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Just Works</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Set up in minutes, not hours. OIDC compliance
                                without the complexity.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
