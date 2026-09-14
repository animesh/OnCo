import Link from "next/link";
import type { Entity } from "@/lib/schema";
import { routeFor } from "@/lib/schema";
import type { Mesh } from "@/lib/wireframe";
import { graph } from "@/lib/graph";
import { ALL_ANIMATED, animatedFor, hasAnimation } from "@/data/schematics";
import { schematicForModality } from "@/data/animated";
import { Wireframe3D } from "./Wireframe3D";

/**
 * Which animated schematic an entity gets. Technologies: their own animation. Products: the first linked
 * technology with an animation, else the animation chosen from the modality text (bispecifics, degraders,
 * oncolytic viruses, vaccines, TIL, TCR-T, antibodies), else the animated schematic of the product's front
 * (chemotherapy, hormonal, targeted therapy, diagnostics, imaging, devices, supportive care).
 */
export function processSchematicKey(entity: Entity): string | null {
  if (entity.kind === "technology") return hasAnimation(entity.id) ? entity.id : null;
  if (entity.kind !== "drug") { const t = entity.technologies.find((id) => hasAnimation(id)); return t ?? null; }
  const key = schematicForModality(entity.modality, entity.technologies);
  return key && key in ALL_ANIMATED ? key : null;
}

/** Serialisable stand-in for an animated mesh (static geometry plus the `anim` marker); Wireframe3D rebuilds the animation client-side. */
function markerFor(key: string): Mesh | undefined {
  const direct = animatedFor(key);
  if (direct) return direct;
  const build = ALL_ANIMATED[key];
  if (!build) return undefined;
  const m = build();
  return { points: m.points, segments: m.segments, labels: m.labels, anim: key };
}

/**
 * Animated process schematic for a technology or product. Every product resolves to something
 * (see processSchematicKey), so this only renders nothing for kinds without a mechanism to draw.
 */
export function ProcessSchematic({ entity, height, bare = false }: { entity: Entity; height?: string; bare?: boolean }) {
  const g = graph();
  const key = processSchematicKey(entity);
  if (!key) return null;
  const mesh = markerFor(key);
  if (!mesh) return null;
  const isFront = key.startsWith("front:");
  const linked = isFront ? g.get(key.slice("front:".length)) : g.get(key);
  const byModality = entity.kind === "drug" && !entity.technologies.includes(key) && key !== entity.id;
  const title = isFront ? `How ${linked?.name?.toLowerCase() ?? "this front"} works, step by step` : "How it works, step by step";
  return (
    <div className={bare ? "overflow-hidden" : "card overflow-hidden"}>
      <Wireframe3D mesh={mesh} height={height ?? "h-64 sm:h-80"} speed={0.18} />
      <div className="px-4 py-3 border-t border-border text-sm flex flex-wrap items-baseline justify-between gap-2">
        <div><span className="font-medium">{title}</span><span className="text-muted"> · animated schematic, not to scale{byModality && entity.kind === "drug" ? `; chosen from the modality "${entity.modality}"` : ""}</span></div>
        {linked && linked.id !== entity.id && <Link href={routeFor(linked)} className="text-xs underline text-muted">{linked.name} →</Link>}
      </div>
    </div>
  );
}
