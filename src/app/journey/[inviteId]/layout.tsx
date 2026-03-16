import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}): Promise<Metadata> {
  const { inviteId } = await params;
  // Bank name from env or default for title
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Mahindra Finance";
  return {
    title: `Complete your account - ${bankName}`,
    description: "Complete your account opening journey.",
  };
}

export default function JourneyInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
