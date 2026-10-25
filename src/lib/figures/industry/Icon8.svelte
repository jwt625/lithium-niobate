<!-- Engraving-style line pictograms for chapter 08 VISUAL figures (value-chain nodes, life cards, section doors).
     64 x 64 user units, stroke = currentColor, hatching for shade; geometry only (no text). -->
<script lang="ts">
  let { name, size = 64 }: { name: string; size?: number } = $props();
</script>

<svg class="i8-ico" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
  {#if name === "ore" || name === "rock"}
    <path d="M10 44 L18 26 L30 18 L44 22 L54 34 L50 48 L32 54 L16 52 Z" />
    <path d="M18 26 L28 34 L30 18 M28 34 L44 22 M28 34 L32 54 M28 34 L16 52 M44 22 L42 38 L54 34 M42 38 L32 54 M42 38 L50 48" stroke-width="1" />
    <path d="M20 46 L26 40 M22 49 L28 43 M36 46 L40 42 M38 49 L44 43" stroke-width="0.8" />
  {:else if name === "brine"}
    <path d="M6 44 Q20 38 32 44 T58 44" /><path d="M6 50 Q20 44 32 50 T58 50" stroke-width="1" />
    <path d="M14 36 L22 22 L30 36 Z M34 36 L44 16 L54 36 Z" stroke-width="1.2" />
    <path d="M38 30 L50 30 M40 26 L48 26" stroke-width="0.8" />
  {:else if name === "powder"}
    <path d="M8 50 Q32 18 56 50 Z" /><path d="M18 50 Q24 40 30 36 M26 50 Q30 42 36 38 M36 50 Q40 44 44 42" stroke-width="0.8" />
    <path d="M44 14 L50 14 L52 22 L42 22 Z" stroke-width="1.2" /><path d="M47 22 L47 30" stroke-width="0.8" stroke-dasharray="1.5 2" />
  {:else if name === "boule"}
    <path d="M32 6 L32 14" /><path d="M29 14 L35 14 L36 18 L28 18 Z" />
    <path d="M28 18 Q20 22 20 30 L20 50 Q20 58 32 58 Q44 58 44 50 L44 30 Q44 22 36 18" />
    <path d="M24 26 L24 54 M28 22 L28 56 M36 22 L36 56 M40 26 L40 54" stroke-width="0.7" />
  {:else if name === "wafer"}
    <path d="M41.6 10 A24 24 0 1 1 22.4 10 Z" />
    <circle cx="32" cy="32" r="16" stroke-width="0.7" stroke-dasharray="2 2" />
  {:else if name === "stack"}
    <path d="M8 22 L32 12 L56 22 L32 32 Z" /><path d="M8 22 L8 28 L32 38 L56 28 L56 22" />
    <path d="M8 28 L8 40 L32 50 L56 40 L56 28" /><path d="M8 40 L8 46 L32 56 L56 46 L56 40" />
    <path d="M14 33 L14 43 M20 35 L20 46 M44 35 L44 46 M50 33 L50 43" stroke-width="0.7" />
  {:else if name === "fab"}
    <circle cx="32" cy="32" r="24" />
    <path d="M14 22 H50 M10 30 H54 M10 38 H54 M14 46 H50 M22 12 V52 M30 9 V55 M38 9 V55 M46 12 V52" stroke-width="0.7" />
  {:else if name === "die"}
    <rect x="8" y="16" width="48" height="32" />
    <path d="M8 32 H18 L22 26 H42 L46 32 H56 M18 32 L22 38 H42 L46 32" stroke-width="1.2" />
    <path d="M22 22 H42 M22 30 H42 M22 34 H42 M22 42 H42" stroke-width="0.8" stroke-dasharray="2 1.5" />
  {:else if name === "module"}
    <path d="M6 24 H48 L56 28 V36 L48 40 H6 Z" /><path d="M48 24 V40" />
    <path d="M12 28 H40 M12 32 H40 M12 36 H40" stroke-width="0.7" /><path d="M56 30 H60 M56 34 H60" />
  {:else if name === "rack" || name === "system"}
    <rect x="16" y="6" width="32" height="52" />
    <path d="M16 16 H48 M16 26 H48 M16 36 H48 M16 46 H48" /><path d="M20 11 H30 M20 21 H30 M20 31 H30 M20 41 H30 M20 51 H30" stroke-width="0.8" />
    <circle cx="42" cy="11" r="1" /><circle cx="42" cy="21" r="1" /><circle cx="42" cy="31" r="1" />
  {:else if name === "phone"}
    <rect x="20" y="6" width="24" height="52" /><path d="M28 10 H36 M30 53 H34" />
    <path d="M24 18 H40 V44 H24 Z" stroke-width="0.8" /><path d="M24 24 H40 M24 30 H40 M24 36 H40" stroke-width="0.6" stroke-dasharray="1.5 1.5" />
  {:else if name === "antenna"}
    <path d="M32 58 L32 24 M24 58 L32 30 L40 58" /><circle cx="32" cy="20" r="3" />
    <path d="M22 12 A14 14 0 0 0 22 28 M42 12 A14 14 0 0 1 42 28 M16 6 A22 22 0 0 0 16 34 M48 6 A22 22 0 0 1 48 34" stroke-width="1" />
  {:else if name === "gyro"}
    <circle cx="32" cy="32" r="22" /><circle cx="32" cy="32" r="17" stroke-width="0.8" /><circle cx="32" cy="32" r="12" stroke-width="0.8" />
    <rect x="26" y="28" width="12" height="8" /><path d="M32 4 V10 M32 54 V60" />
  {:else if name === "beam"}
    <rect x="4" y="26" width="18" height="12" /><rect x="28" y="28" width="12" height="8" stroke-width="1.2" />
    <path d="M22 32 H28" stroke-dasharray="3 2" /><path d="M40 32 H60" stroke-width="2.4" />
    <path d="M31 28 V36 M34 28 V36 M37 28 V36" stroke-width="0.6" />
  {:else if name === "qubit"}
    <rect x="10" y="14" width="44" height="36" /><path d="M10 26 H22 Q32 26 32 32 Q32 38 42 38 H54 M10 38 H22 Q32 38 32 32 Q32 26 42 26 H54" stroke-width="1.2" />
  {:else if name === "cpu"}
    <rect x="16" y="16" width="32" height="32" /><rect x="24" y="24" width="16" height="16" stroke-width="1" />
    <path d="M22 16 V8 M30 16 V8 M38 16 V8 M46 16 V8 M22 48 V56 M30 48 V56 M38 48 V56 M46 48 V56 M16 22 H8 M16 30 H8 M16 38 H8 M48 22 H56 M48 30 H56 M48 38 H56" stroke-width="1" />
  {:else if name === "laser"}
    <rect x="4" y="24" width="22" height="16" /><path d="M30 22 L42 22 L42 42 L30 42 Z" stroke-width="1.2" />
    <path d="M26 32 H30 M42 32 H60" stroke-width="1.8" /><path d="M33 26 H39 M33 38 H39" stroke-width="0.8" />
  {:else if name === "lidar"}
    <path d="M8 44 L14 34 H40 L48 44 Z" /><circle cx="18" cy="46" r="4" /><circle cx="40" cy="46" r="4" />
    <rect x="22" y="28" width="8" height="6" /><path d="M30 31 L58 18 M30 31 L58 31 M30 31 L58 44" stroke-width="0.8" stroke-dasharray="2 2" />
  {:else if name === "grid"}
    <rect x="6" y="10" width="52" height="44" /><path d="M6 24 H58 M6 38 H58 M24 10 V54 M42 10 V54" stroke-width="1" />
    <rect x="10" y="14" width="10" height="6" stroke-width="0.8" /><rect x="28" y="28" width="10" height="6" stroke-width="0.8" /><rect x="46" y="42" width="8" height="6" stroke-width="0.8" />
  {:else if name === "scatter"}
    <path d="M8 6 V56 H60" /><path d="M14 46 l3 -3 l3 3 l-3 3 Z M24 36 l3 -3 l3 3 l-3 3 Z M34 30 l3 -3 l3 3 l-3 3 Z M44 18 l3 -3 l3 3 l-3 3 Z" stroke-width="1.2" />
    <circle cx="20" cy="24" r="2.5" stroke-width="1" /><rect x="40" y="38" width="5" height="5" stroke-width="1" />
  {:else if name === "board"}
    <rect x="6" y="8" width="52" height="48" /><rect x="11" y="13" width="18" height="12" stroke-width="1" /><rect x="35" y="13" width="18" height="12" stroke-width="1" />
    <rect x="11" y="31" width="18" height="12" stroke-width="1" /><rect x="35" y="31" width="18" height="12" stroke-width="1" /><path d="M11 49 H53" stroke-width="0.8" />
  {:else if name === "strips"}
    <path d="M6 56 H60" /><path d="M14 14 H40 M10 24 H52 M20 34 H34 M16 44 H48" stroke-width="5" stroke-opacity="0.5" />
    <path d="M14 10 V18 M40 10 V18 M10 20 V28 M52 20 V28 M20 30 V38 M34 30 V38 M16 40 V48 M48 40 V48" stroke-width="1" />
  {:else if name === "timeline"}
    <path d="M4 40 H60" /><path d="M10 36 V44 M22 36 V44 M34 36 V44 M46 36 V44 M58 36 V44" stroke-width="0.8" />
    <path d="M16 40 l3 -3 l3 3 l-3 3 Z M30 40 l3 -3 l3 3 l-3 3 Z M42 40 l3 -3 l3 3 l-3 3 Z" /><path d="M19 37 V22 M33 37 V16 M45 37 V26" stroke-width="0.8" />
  {/if}
</svg>
