import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    render,
    Section,
    Text,
} from "@react-email/components";

type LinkEmailProps = {
    fileName: string;
    inviteId: string;
    from: string;
};

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

export const LinkEmailHTML = async (
    fileName: string,
    inviteId: string,
    from: string
) => {
    return await render(
        <LinkEmail fileName={fileName} from={from} inviteId={inviteId} />
    );
};

export const RawLinkEmailHTML = (
    fileName: string,
    inviteId: string,
    from: string
) => {
    return `
 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" >
 <html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <div
    data-skip-in-text="true"
    style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
    You&#x27;ve been invited to view ${fileName}
    <div>
    </div>
  </div>
  <body class="mx-auto my-auto bg-white font-sans">
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      width="100%">
      <tbody>
        <tr>
          <td>
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              class="mx-auto my-[40px] w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]"
              role="presentation"
              style="max-width:37.5em"
              width="100%">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="mt-[32px]"
                      role="presentation"
                      width="100%">
                      <tbody>
                        <tr>
                          <td>
                            <h1
                              class="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
                              📁 File Share Invitation
                            </h1>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="text-center"
                      role="presentation"
                      width="100%">
                      <tbody>
                        <tr>
                          <td>
                            <p
                              class="text-[14px] text-black leading-[24px]"
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              Hello! 👋
                            </p>
                            <p
                              class="text-[14px] text-black leading-[24px]"
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              ${from} has shared a file with you and you&#x27;ve been
                              invited to view it.
                            </p>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="my-[20px] rounded-lg border border-[#e6e6e6] border-solid bg-[#f6f9fc] p-[20px]"
                              role="presentation"
                              width="100%">
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      class="m-0 mb-[8px] font-semibold text-[16px] text-black"      
                                      style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                                      📄
                                      <!-- -->${fileName}
                                    </p>
                                    <p
                                      class="m-0 text-[12px] text-gray-600"
                                      style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                                      Secure file sharing
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              class="mt-[32px] mb-[32px] text-center"
                              role="presentation"
                              width="100%">
                              <tbody>
                                <tr>
                                  <td>
                                    <a
                                      class="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                                      href="https://better-storage.untraceable.dev/invite/${inviteId}"
                                      rel="noopener"
                                      style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px" target="_blank"
                                      ><span
                                        ><!--[if mso]><i hidden style="mso-font-width:0%;mso-text-raise:0" /><![endif]--></span
                                      ><span
                                        style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px"
                                        >View File</span
                                      ><span
                                        ><!--[if mso]><i hidden style="mso-font-width:0%">&#8203;</i><![endif]--></span
                                      ></a
                                    >
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p
                              class="text-[14px] text-black leading-[24px]"
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              Or copy and paste this URL into your browser:<!-- -->
                              <a
                                class="text-blue-600 no-underline"
                                href="https://better-storage.untraceable.dev/invite/${inviteId}"
                                rel="noopener"
                                style="color:#067df7;text-decoration-line:none" target="_blank"
                                >https://better-storage.untraceable.dev/invite/${inviteId}</a
                              >
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="mt-[32px]"
                      role="presentation"
                      width="100%">
                      <tbody>
                        <tr>
                          <td>
                            <p
                              class="text-center text-[12px] text-gray-400 leading-[24px]"
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              🔒 This link is secure and will expire after use
                              or after a certain time period. If you didn&#x27;t
                              expect this invitation, you can safely ignore this
                              email.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="mt-[32px] border-[#eaeaea] border-t border-solid pt-[20px]"
                      role="presentation"
                      width="100%">
                      <tbody>
                        <tr>
                          <td>
                            <p
                              class="text-center text-[12px] text-gray-400 leading-[24px]"
                              style="font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px">
                              Sent from Better Storage
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};
