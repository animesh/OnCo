import { graph } from "./graph";
import { routeFor } from "./schema";
import type { MyCancerLite } from "./use-my-cancer";

/** The list a server component hands to the MyCancer client pieces: every cancer as (id, name, route). */
export function myCancerList(): MyCancerLite[] {
  return graph().kind("cancer").map((c) => ({ id: c.id, name: c.name, route: routeFor(c) }));
}

/** The same list with the group and TL;DR, for the pinned tile on the cancer hub. */
export function myCancerTiles(): Array<MyCancerLite & { group: string; tldr: string }> {
  return graph().kind("cancer").map((c) => ({ id: c.id, name: c.name, route: routeFor(c), group: c.group, tldr: c.tldr }));
}
