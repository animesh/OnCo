import { describe, expect, it } from "vitest";
import { assembleTopic } from "./WhatIsBeingDone";

const ids = (data: NonNullable<ReturnType<typeof assembleTopic>>) => [
  ...data.now,
  ...data.trials,
  ...data.ideas,
  ...data.background,
].map((entity) => entity.id);

function lateDiagnosis(cancerId?: string) {
  const data = assembleTopic("late-diagnosis", cancerId);
  expect(data).not.toBeNull();
  if (!data) throw new Error("Expected late-diagnosis data");
  return ids(data);
}

describe("assembleTopic", () => {
  it("shows only late-diagnosis work applicable to glioblastoma", () => {
    const data = assembleTopic("late-diagnosis", "glioblastoma");
    expect(data).not.toBeNull();
    if (!data) throw new Error("Expected late-diagnosis data");
    const applicable = ids(data);

    expect(applicable).toEqual(expect.arrayContaining(["mri", "methylation-profiling"]));
    for (const id of ["colorectal-screening", "hcc-surveillance", "kerala-oral-screening", "mumbai-via-screening", "nlst-nelson"]) {
      expect(applicable).not.toContain(id);
    }
    expect(data.background).toEqual([]);
  });

  it("keeps the general topic broad while filtering another cancer-specific card", () => {
    const general = lateDiagnosis();
    expect(general).toEqual(expect.arrayContaining([
      "colorectal-screening",
      "hcc-surveillance",
      "kerala-oral-screening",
      "mumbai-via-screening",
      "nlst-nelson",
    ]));

    const hcc = lateDiagnosis("hcc");
    expect(hcc).toContain("hcc-surveillance");
    expect(hcc).not.toContain("colorectal-screening");
  });
});
