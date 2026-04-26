import { supabase } from "@/integrations/supabase/client";
import type { DatasetKind } from "@/lib/ingest";

/* Public data layer.
 * RLS guarantees these queries only see live datasets in active contexts. */

export interface LiveContext {
  id: string;
  code: string;
  name: string;
  flag_emoji: string | null;
  locale: string;
}

export async function fetchActiveContexts(): Promise<LiveContext[]> {
  const { data, error } = await supabase
    .from("contexts")
    .select("id,code,name,flag_emoji,locale")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as LiveContext[];
}

/** Resolve the live dataset id for a context+kind, or null if none published. */
export async function fetchLiveDatasetId(
  contextId: string,
  kind: DatasetKind,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("datasets")
    .select("id")
    .eq("context_id", contextId)
    .eq("kind", kind)
    .eq("status", "live")
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export interface SkillRow {
  code: string;
  label: string;
  source: string | null;
  level: number;
  parent_code: string | null;
}

export interface OccupationRow {
  code: string;
  title: string;
  isco_major: string | null;
  automation_risk: number | null;
}

export interface OpportunityRow {
  id: string;
  title: string;
  employer: string | null;
  sector: string | null;
  region: string | null;
  remote: boolean;
  url: string | null;
  skills: string[];
}

export async function fetchLiveSkills(contextId: string): Promise<SkillRow[]> {
  const dsId = await fetchLiveDatasetId(contextId, "taxonomy");
  if (!dsId) return [];
  const { data, error } = await supabase
    .from("taxonomy_skills")
    .select("code,label,source,level,parent_code")
    .eq("dataset_id", dsId)
    .order("level")
    .order("label")
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as SkillRow[];
}

export async function fetchLiveOccupations(
  contextId: string,
): Promise<OccupationRow[]> {
  const dsId = await fetchLiveDatasetId(contextId, "occupations");
  if (!dsId) return [];
  const { data, error } = await supabase
    .from("occupations")
    .select("code,title,isco_major,automation_risk")
    .eq("dataset_id", dsId)
    .order("automation_risk", { ascending: false, nullsFirst: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as OccupationRow[];
}

export async function fetchLiveOpportunities(
  contextId: string,
): Promise<OpportunityRow[]> {
  const dsId = await fetchLiveDatasetId(contextId, "opportunities");
  if (!dsId) return [];
  const { data, error } = await supabase
    .from("opportunities")
    .select("id,title,employer,sector,region,remote,url,skills")
    .eq("dataset_id", dsId)
    .order("title")
    .limit(500);
  if (error) throw error;
  return (data ?? []) as OpportunityRow[];
}