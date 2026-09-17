import type { CSSProperties } from "react";
import { MotionScope } from "./MotionScope";

/**
 * Garden: hand-drawn botanical line art used as quiet background decoration (fern fronds, a leaf
 * spray, a line of grass with seed heads). Everything is inline SVG, no images, no dependencies.
 *
 * The three drawings are registered once per page as <symbol>s by <GardenDefs/> (rendered at the top
 * of the root layout) and every instance is a tiny <use>, so a page with a dozen fronds adds a few
 * hundred bytes, not kilobytes. Strokes are currentColor: the theme sets the ink through `.garden`
 * (globals.css), the contrast theme hides `.garden` altogether, and `prefers-reduced-motion` stops
 * the sway. All decoration is aria-hidden and ignores pointer events.
 *
 * Path data was drawn once with a small script and pasted here as literals; the numbers are the art.
 */

const FERN_RACHIS = "M118 414 C104 320 112 190 156 22";
const FERN_PINNAE = "M114.5 384.7Q104 371.8 87.7 369.1Q98.1 382 114.5 384.7M114.5 384.7Q99.2 370.6 87.7 369.1M113.7 376.1Q132.3 369.6 141.9 352.5Q123.3 358.9 113.7 376.1M113.7 376.1Q128.7 356.5 141.9 352.5M113 366.1Q99.2 347.9 76.7 343.4Q90.5 361.7 113 366.1M113 366.1Q92.6 345.9 76.7 343.4M112.5 357.2Q136.9 349.5 149.9 327.6Q125.6 335.3 112.5 357.2M112.5 357.2Q132.7 332.3 149.9 327.6M112.1 346.7Q95.7 323.8 68.2 317.5Q84.6 340.5 112.1 346.7M112.1 346.7Q87.6 321.2 68.2 317.5M111.9 337.4Q141.1 329.1 157.4 303.5Q128.2 311.8 111.9 337.4M111.9 337.4Q136.7 308.5 157.4 303.5M111.7 326.5Q93.5 299.5 62 291.4Q80.2 318.4 111.7 326.5M111.7 326.5Q84.3 296.3 62 291.4M111.7 316.8Q144.9 308.4 164.2 280Q131 288.5 111.7 316.8M111.7 316.8Q140.7 285 164.2 280M111.9 305.6Q92.6 275.2 58 265.3Q77.3 295.7 111.9 305.6M111.9 305.6Q82.5 271.3 58 265.3M112.2 295.5Q148.5 287.3 170.1 257Q133.8 265.2 112.2 295.5M112.2 295.5Q144.5 261.8 170.1 257M112.7 283.8Q92.9 250.9 56.3 239.4Q76.1 272.3 112.7 283.8M112.7 283.8Q82.3 246.5 56.3 239.4M113.2 273.4Q151.6 265.7 175.2 234.4Q136.8 242.1 113.2 273.4M113.2 273.4Q148.1 238.8 175.2 234.4M114 261.2Q94.4 226.6 56.8 213.8Q76.4 248.4 114 261.2M114 261.2Q83.5 221.8 56.8 213.8M114.8 250.4Q154.3 243.5 179.2 212.1Q139.7 219.1 114.8 250.4M114.8 250.4Q151.4 215.9 179.2 212.1M116 237.9Q97 202.5 59.4 188.7Q78.3 224 116 237.9M116 237.9Q86.1 197.4 59.4 188.7M117.1 226.7Q156.6 220.7 182.1 190Q142.6 196 117.1 226.7M117.1 226.7Q154.3 193.2 182.1 190M118.6 213.7Q100.8 178.6 64.1 164.1Q81.9 199.3 118.6 213.7M118.6 213.7Q90.2 173.3 64.1 164.1M120 202.2Q158.4 197.2 183.8 168Q145.4 173 120 202.2M120 202.2Q156.8 170.5 183.8 168M121.8 188.8Q105.5 154.8 70.8 140.2Q87.1 174.2 121.8 188.8M121.8 188.8Q95.5 149.5 70.8 140.2M123.6 176.8Q159.9 172.9 184.5 145.9Q148.1 149.8 123.6 176.8M123.6 176.8Q158.9 147.7 184.5 145.9M125.7 163Q111.3 131.2 79.4 117Q93.8 148.8 125.7 163M125.7 163Q102.1 126.1 79.4 117M127.8 150.7Q161 147.8 183.9 123.6Q150.7 126.5 127.8 150.7M127.8 150.7Q160.6 124.8 183.9 123.6M130.3 136.4Q118 107.7 89.7 94.5Q102.1 123.2 130.3 136.4M130.3 136.4Q109.9 103 89.7 94.5M132.7 123.7Q161.8 121.8 182.3 101.1Q153.2 103 132.7 123.7M132.7 123.7Q161.9 101.6 182.3 101.1M135.7 109Q125.7 84.4 101.8 72.7Q111.8 97.3 135.7 109M135.7 109Q118.8 80.3 101.8 72.7M138.4 96Q162.4 94.9 179.6 78.1Q155.6 79.2 138.4 96M138.4 96Q162.8 78.2 179.6 78.1M141.7 80.8Q134.2 61.3 115.6 51.7Q123.1 71.2 141.7 80.8M141.7 80.8Q128.9 57.9 115.6 51.7M144.8 67.4Q162.7 66.9 175.8 54.6Q157.8 55.1 144.8 67.4M144.8 67.4Q163.2 54.5 175.8 54.6M148.5 51.8Q143.6 38.5 131.1 31.7Q136 45.1 148.5 51.8M148.5 51.8Q140 36.1 131.1 31.7M151.9 38Q162.4 37.9 170.2 30.8Q159.7 30.9 151.9 38M151.9 38Q162.8 30.6 170.2 30.8";
const SPRAY_STEM = "M8 174 C70 150 150 80 246 30";
const SPRAY_TWIGS = "M43.2 157Q47.5 147.4 44.9 141.7M68.6 141.8Q80.3 143 85.3 148.6M95.5 124.3Q99.2 112.2 96.2 104.5M123.9 105.3Q136 106.3 141.6 111.9M153.7 85.3Q157.4 74.6 154.4 68.3M185 65.2Q195 65.8 198.3 70.7M217.7 45.5Q221.5 40.3 218.3 39.1M240.3 33Q246 32.3 244.7 35.2";
const SPRAY_LEAVES = "M44.9 141.7Q56.7 127.6 48.6 107.9Q36.4 125.4 44.9 141.7M44.9 141.7L48.3 110.9M85.3 148.6Q97.4 166.5 122.3 163.7Q106.5 144.3 85.3 148.6M85.3 148.6L119.5 162.6M96.2 104.5Q110.1 85.2 97.7 60.5Q83.7 84.3 96.2 104.5M96.2 104.5L97.6 63.5M141.6 111.9Q154.9 130.3 180.9 126.6Q163.7 106.7 141.6 111.9M141.6 111.9L178.1 125.5M154.4 68.3Q166.4 51.6 155.8 30.3Q143.6 50.7 154.4 68.3M154.4 68.3L155.7 33.3M198.3 70.7Q208 85 227.9 82.9Q215.3 67.3 198.3 70.7M198.3 70.7L225.1 81.7M218.3 39.1Q227.2 28.2 220.9 13.2Q211.7 26.7 218.3 39.1M218.3 39.1L220.6 16.2M244.7 35.2Q250.1 44.6 262.7 44.1Q255.5 33.9 244.7 35.2M244.7 35.2L260 42.8";
const GRASS_BLADES = "M6 90Q6.9 60.5 9.6 42.5M18.9 90Q19 62.1 19.3 45M38.7 90Q39.6 71.3 42.3 59.8M50.5 90Q57.1 74.7 76.8 65.4M61.4 90Q68.2 62 88.7 44.9M77.1 90Q79.7 58.6 87.4 39.4M88.8 90Q88 44.6 85.6 16.7M106.6 90Q101.4 65.7 85.8 50.8M121.2 90Q114.9 65.1 96 49.8M134 90Q133.6 47.9 132.3 22M152.7 90Q156.6 63.4 168.2 47.1M163.9 90Q163.1 69.1 160.9 56.4M173.6 90Q176.3 63.1 184.5 46.6M197.9 90Q197 65.9 194.2 51.1M213.9 90Q213.2 49.3 211 24.4M227.2 90Q230.8 68.7 241.7 55.7M240.5 90Q245.9 51.6 262 28.1M264.3 90Q268 48.6 279.2 23.3M282.2 90Q279.5 75.6 271.6 66.7M294.6 90Q297.4 63.7 305.8 47.5M307.9 90Q300.5 45.5 278.3 18.3M326.3 90Q320.1 62.1 301.6 45.1M342.6 90Q343.9 48.2 347.8 22.6M353.6 90Q359.5 50.8 377.3 26.8M363 90Q366.1 71.4 375.4 60M382.5 90Q378.5 48.3 366.3 22.8M394.2 90Q387.9 75.2 369.1 66.1M408.9 90Q405.9 68.9 396.7 56M420.1 90Q412.6 71.1 390.2 59.4M430.5 90Q424.6 63.4 407 47M446.1 90Q450 76.1 461.5 67.6M466.9 90Q473.4 65.5 492.8 50.4M486.2 90Q484.1 67.7 477.7 54.1M503.8 90Q504.2 47.1 505.5 20.9M514.7 90Q517.2 47.4 524.4 21.3M538.2 90Q537.6 54.5 535.7 32.7M561.4 90Q561.4 63 561.3 46.4M583 90Q583.7 46.9 585.7 20.4M602.2 90Q601.3 49.6 598.6 24.9M622.7 90Q620.7 74.7 614.9 65.3M647.6 90Q642.4 55.1 626.8 33.7M659.3 90Q659.7 69.9 660.9 57.6M668.6 90Q668.8 45.4 669.5 18.1M690.9 90Q688.5 70.6 681.5 58.7M714.2 90Q708 58 689.3 38.4M730.9 90Q729.5 68.3 725.1 55M745.2 90Q738.6 75.5 718.9 66.6M761.5 90Q767.5 58.5 785.6 39.2M777 90Q775.4 69.2 770.4 56.4M793.9 90Q795.8 68.9 801.6 56M818.1 90Q824.7 64 844.8 48.1M833.7 90Q829.3 73.6 816.3 63.5M854.2 90Q861.2 57.4 882.1 37.4M868.9 90Q863.8 66 848.4 51.3M887.8 90Q890.9 50.9 900.3 26.9M906.2 90Q909.3 72.1 918.7 61.1M924.9 90Q922.4 65.6 915 50.7M943 90Q941.3 72.4 936.4 61.6M963.9 90Q964.3 59.4 965.5 40.6M979 90Q973.6 73.6 957.5 63.5M1002.8 90Q1009.1 52.1 1028.2 28.8M1025.6 90Q1019.4 62.1 1000.8 45.1M1040.1 90Q1036.3 68.4 1024.7 55.1M1056.8 90Q1053 66.4 1041.4 51.9M1074.9 90Q1076.2 69.4 1080.1 56.8M1091.8 90Q1084.3 73.4 1061.8 63.2M1108.1 90Q1109.9 76.2 1115.3 67.8M1118.6 90Q1117.5 66.5 1114.5 52.1M1142.9 90Q1137.9 48.2 1123 22.5M1152.9 90Q1151 56 1145.2 35.2M1177.1 90Q1171.8 57.2 1155.7 37M1197.4 90Q1193.6 75.9 1182.1 67.3";
const GRASS_HEADS = "M19.3 45L19.3 28.2M18 28a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M15.8 25.5a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M18.4 20.9a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M17.3 18a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M369.1 66.1L366.6 52.7M366.9 53.4a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M362.1 49.5a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M361.5 45.8a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M364.5 42.2a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M477.7 54.1L476.9 37.3M472 36.4a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M472.7 33.7a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M471.6 31.1a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M474.5 27.4a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M598.6 24.9L598.2 7.1M596.6 7.4a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M595.5 4.4a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M598.2 0.7a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M595.8 -1.7a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M669.5 18.1L669.6 6.2M665.3 6.5a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M665.7 3.5a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M666.2 0.6a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M668.2 -3.6a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M770.4 56.4L769.8 47.1M769.4 47.8a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M764.5 44a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M766.2 40.4a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M765.9 38a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1024.7 55.1L1023.2 43.6M1020.1 44.5a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1023.4 40.6a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1021.5 36.3a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1020.9 33.3a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1123 22.5L1121 6.1M1122.4 6.8a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1120.7 3.1a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1121.9 -1.2a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0M1117.6 -3.2a2 2.8 0 1 0 4 0a2 2.8 0 1 0 -4 0";

const FERN_BOX = "0 0 240 420";
const SPRAY_BOX = "0 0 260 180";
const GRASS_BOX = "0 -30 1200 120";

/** Small, stable hash of a string: lets page headers vary their motif by title without any state. */
export function gardenSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Symbol definitions. Render once per document (the root layout does). */
export function GardenDefs() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <symbol id="garden-fern" viewBox={FERN_BOX} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={FERN_RACHIS} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        <path d={FERN_PINNAE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </symbol>
      <symbol id="garden-spray" viewBox={SPRAY_BOX} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={SPRAY_STEM} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        <path d={SPRAY_TWIGS} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={SPRAY_LEAVES} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </symbol>
      <symbol id="garden-grass" viewBox={GRASS_BOX} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={GRASS_BLADES} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={GRASS_HEADS} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </symbol>
    </svg>
  );
}

type ArtProps = {
  className?: string;
  style?: CSSProperties;
  /** Static lean in degrees, applied around the base of the drawing. */
  tilt?: number;
  /** Mirror left to right. */
  flip?: boolean;
  /** Slow sway (CSS only; off under reduced motion and in the contrast theme). */
  sway?: boolean;
  /** One full sway back and forth, in seconds. */
  swaySeconds?: number;
  preserveAspectRatio?: string;
};

function Art({ id, viewBox, className = "", style, tilt = 0, flip = false, sway = false, swaySeconds = 16, preserveAspectRatio }: ArtProps & { id: string; viewBox: string }) {
  const vars = { "--tilt": `${tilt}deg`, "--flip": flip ? -1 : 1, "--sway": `${swaySeconds}s`, ...style } as CSSProperties;
  return (
    <svg viewBox={viewBox} preserveAspectRatio={preserveAspectRatio} aria-hidden="true" focusable="false"
      className={`garden-art pointer-events-none h-auto ${sway ? "garden-sway motion-css" : ""} ${className}`} style={vars}>
      <use href={`#${id}`} />
    </svg>
  );
}

/** One fern frond, base at the bottom centre, tip at the top. Portrait, 240 x 420. */
export function FernFrond(p: ArtProps) { return <Art id="garden-fern" viewBox={FERN_BOX} {...p} />; }

/** A leafy twig rising from bottom-left to top-right. Landscape, 260 x 180. */
export function LeafSpray(p: ArtProps) { return <Art id="garden-spray" viewBox={SPRAY_BOX} {...p} />; }

/** A strip of grass blades with a few seed heads, baseline at the bottom. 1200 wide. */
export function GrassLine(p: ArtProps) { return <Art id="garden-grass" viewBox={GRASS_BOX} {...p} />; }

/**
 * Ready-made arrangements. The parent must be `position: relative`; the backdrop fills or hugs an
 * edge of it and clips its own art, so it never needs overflow-hidden on the parent (dropdowns and
 * popovers keep working). Content that should paint above the art should also be `relative`.
 *
 *  hero    fronds rising from the corners of the home hero; the one behind the headline is a whisper
 *  page    a leaf spray or frond in the top-right of a page header, chosen by `seed`; hidden below sm
 *  footer  a low grass line growing up from the footer's top edge
 *  card    a faint leaf in the top-right corner of a card
 */
export function GardenBackdrop({ variant, seed = 0, className = "" }: { variant: "hero" | "page" | "footer" | "card"; seed?: number; className?: string }) {
  const base = "garden pointer-events-none absolute select-none";

  if (variant === "hero") {
    return (
      // MotionScope pauses the sway while the hero is off screen or the tab is hidden (src/lib/use-animation-budget.ts).
      <MotionScope aria-hidden="true" className={`${base} garden-hero-fade inset-0 overflow-hidden ${className}`}>
        {/* Right corner: a tall frond, with a shorter one leaning the other way from lg. */}
        <FernFrond sway tilt={-9} swaySeconds={19}
          className="absolute -right-10 -top-6 w-[13rem] sm:w-[17rem] lg:w-[22rem] xl:w-[25rem] opacity-[0.06] lg:opacity-[0.15] lg:dark:opacity-[0.2]" />
        <FernFrond sway flip tilt={11} swaySeconds={23} style={{ animationDelay: "-8s" }}
          className="hidden lg:block absolute right-[11rem] xl:right-[14rem] top-4 w-[11rem] xl:w-[13rem] opacity-[0.1] dark:opacity-[0.14]" />
        {/* Left corner, behind the headline: never more than a whisper. */}
        <FernFrond sway tilt={13} swaySeconds={21} style={{ animationDelay: "-4s" }}
          className="hidden sm:block absolute -left-20 -top-4 w-[15rem] lg:w-[19rem] opacity-[0.055] dark:opacity-[0.07]" />
      </MotionScope>
    );
  }

  if (variant === "page") {
    const motif = seed % 3;
    const tilt = ((seed >>> 3) % 13) - 6;
    const flip = ((seed >>> 7) & 1) === 1;
    return (
      // Anchored to the top of the header and capped in height, so tall headers (filters, legends,
      // buttons in the `right` slot low down) never get art behind their text.
      <div aria-hidden="true" className={`${base} garden-fade top-0 bottom-0 max-h-[14rem] right-0 hidden sm:block w-[20rem] lg:w-[26rem] overflow-hidden ${className}`}>
        {motif === 0 && <LeafSpray tilt={tilt - 6} flip={!flip} className="absolute -right-6 -top-2 w-[16rem] lg:w-[21rem] opacity-[0.085] dark:opacity-[0.13]" />}
        {motif === 1 && <FernFrond tilt={tilt - 14} flip={flip} className="absolute right-2 lg:right-8 -top-6 w-[8rem] lg:w-[10rem] opacity-[0.08] dark:opacity-[0.12]" />}
        {/* A branch reaching in from the corner: the spray turned through 180deg about its own centre. */}
        {motif === 2 && <LeafSpray tilt={176 + tilt} flip={flip} style={{ transformOrigin: "50% 50%" }} className="absolute -right-2 -top-6 w-[15rem] lg:w-[19rem] opacity-[0.085] dark:opacity-[0.13]" />}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div aria-hidden="true" className={`${base} inset-x-0 top-0 h-28 -translate-y-full overflow-hidden ${className}`}>
        <GrassLine preserveAspectRatio="xMidYMax slice" className="absolute inset-0 !h-full w-full opacity-[0.3] dark:opacity-[0.32]" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`${base} right-0 top-0 h-full w-32 overflow-hidden rounded-[inherit] ${className}`}>
      <LeafSpray tilt={-12 + (seed % 9)} className="absolute -right-10 -top-7 w-40 opacity-[0.05] dark:opacity-[0.07]" />
    </div>
  );
}
