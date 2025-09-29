import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface LinkEmailProps {
    fileName: string;
    inviteId: string;
    from: string;
}

export default function LinkEmail({
    fileName,
    inviteId,
    from,
}: LinkEmailProps) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/invite/${inviteId}`;

    return (
        <Html>
            <Head />
            <Preview>You've been invited to view {fileName}</Preview>
            <Body className="mx-auto my-auto bg-white font-sans">
                <Container className="mx-auto my-[40px] w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
                    {/* Header with logo/branding */}
                    <Section className="mt-[32px]">
                        <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
                            📁 File Share Invitation
                        </Heading>
                    </Section>

                    {/* Main content */}
                    <Section className="text-center">
                        <Text className="text-[14px] text-black leading-[24px]">
                            Hello! 👋
                        </Text>
                        <Text className="text-[14px] text-black leading-[24px]">
                            {from} has shared a file with you and you've been
                            invited to view it.
                        </Text>

                        {/* File info card */}
                        <Section className="my-[20px] rounded-lg border border-[#e6e6e6] border-solid bg-[#f6f9fc] p-[20px]">
                            <Text className="m-0 mb-[8px] font-semibold text-[16px] text-black">
                                📄 {fileName}
                            </Text>
                            <Text className="m-0 text-[12px] text-gray-600">
                                Secure file sharing
                            </Text>
                        </Section>

                        {/* CTA Button */}
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Button
                                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                                href={inviteUrl}
                            >
                                View File
                            </Button>
                        </Section>

                        {/* Alternative link */}
                        <Text className="text-[14px] text-black leading-[24px]">
                            Or copy and paste this URL into your browser:{" "}
                            <Link
                                className="text-blue-600 no-underline"
                                href={inviteUrl}
                            >
                                {inviteUrl}
                            </Link>
                        </Text>
                    </Section>

                    {/* Security notice */}
                    <Section className="mt-[32px]">
                        <Text className="text-center text-[12px] text-gray-400 leading-[24px]">
                            🔒 This link is secure and will expire after use or
                            after a certain time period. If you didn't expect
                            this invitation, you can safely ignore this email.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section className="mt-[32px] border-[#eaeaea] border-t border-solid pt-[20px]">
                        <Text className="text-center text-[12px] text-gray-400 leading-[24px]">
                            Sent from Better Okta File Manager
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

export { LinkEmail };
