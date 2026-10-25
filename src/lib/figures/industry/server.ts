// Server-only helpers for the chapter 08 page loads (prerender): the atlas subset and the generated industry events.
import raw from "../../../../static/data/industry/atlas-ln.json";
import events from "$lib/generated/events-industry.json";
import type { Atlas } from "./atlas";

export const ATLAS_DATA = raw as unknown as Atlas;

export interface IndEvent { id: string; date: string; title: string; grade: string; tags: string[]; organizations: string[]; notes?: string; date_note?: string; access_date: string; citations: { text: string; url: string; accessed: string; source_ref: string }[] }
export const EVENTS = (events as unknown as IndEvent[]).filter((e) => (e as unknown as { verified?: boolean }).verified !== false);
