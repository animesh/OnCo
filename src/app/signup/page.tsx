import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = pageMeta({ title: "Stay in the loop", description: "Leave your email and OnCo will write when something big changes in cancer research: approvals, failed trials, guideline changes. No spam, one click to unsubscribe.", path: "/signup/" });

export default function SignupPage() {
  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="Stay in the loop" lede="Leave your email and OnCo will write when something big changes in cancer research: new approvals, trials that read out or fail, guideline changes. One message when it matters, no spam, one click to unsubscribe." />
      <Container className="pb-16 max-w-xl space-y-6">
        <SignupForm />
        <div className="text-sm text-muted space-y-2">
          <p>What an account gives you: your <Link className="underline" href="/saved/">watchlist and saved views</Link> synced across devices, your cancer choice remembered, and alerts when a trial or treatment you follow changes. Sign-in is by emailed link, so there is no password to lose.</p>
          <p>What we store: your email address with the list provider, nothing else. The site itself sets no advertising trackers; Google Analytics counts visits, as the <Link className="underline" href="/about/">about page</Link> says.</p>
        </div>
      </Container>
    </>
  );
}
