import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { SearchResults } from "@/components/SearchResults";
import { myCancerList } from "@/lib/my-cancer-list";

export const metadata: Metadata = pageMeta({ title: "Search", description: "Search every OnCo record by name or by meaning: word matches and concept matches, merged, each with the reason it ranked.", path: "/search/" });

export default function SearchPage() {
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Search" lede="Word search and concept search, side by side. Type a name, a code, or a plain phrase such as a drug for HER2-low breast cancer. Every result says why it matched. Everything runs in your browser." />
      <Container className="pb-16">
        <Suspense><SearchResults cancers={myCancerList()} /></Suspense>
      </Container>
    </>
  );
}
