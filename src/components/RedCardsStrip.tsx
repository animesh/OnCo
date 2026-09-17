import { graph } from "@/lib/graph";
import type { Cancer } from "@/lib/schema";
import { redCardsForCancer } from "@/lib/red-cards";
import { RedCards } from "./RedCards";

/** Server wrapper: the red cards for one cancer, or nothing when its standard of care carries no warning. */
export function RedCardsStrip({ cancer }: { cancer: Cancer }) {
  const cards = redCardsForCancer(graph(), cancer);
  return <RedCards cards={cards} cancerName={cancer.name} />;
}
