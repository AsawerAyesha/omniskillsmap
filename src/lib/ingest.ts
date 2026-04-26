import { z } from "zod";

/* CSV ingestion schemas + parser.
 * Used by the operator console to validate uploaded CSVs before insert.
 * Also defines column templates so we can surface "download example CSV". */

export type DatasetKind =
  | "taxonomy"
  | "occupations"
  | "labor"
  | "opportunities"
  | "learning";

/* ---- per-kind row schemas ---- */

export const taxonomyRow = z.object({
  code: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(255),
  source: z.string().trim().max(64).optional().nullable(),
  level: z.coerce.number().int().min(0).max(10).default(0),
  parent_code: z.string().trim().max(64).optional().nullable(),
});

export const occupationsRow = z.object({
  code: z.string().trim().min(1).max(32),
  title: z.string().trim().min(1).max(255),
  isco_major: z.string().trim().max(8).optional().nullable(),
  automation_risk: z.coerce.number().min(0).max(1).optional().nullable(),
});

export const laborRow = z.object({
  indicator_code: z.string().trim().min(1).max(64),
  year: z.coerce.number().int().min(1900).max(2100),
  value: z.coerce.number().optional().nullable(),
  age_band: z.string().trim().max(32).optional().nullable(),
  sex: z.string().trim().max(8).optional().nullable(),
});

export const opportunitiesRow = z.object({
  title: z.string().trim().min(1).max(255),
  employer: z.string().trim().max(255).optional().nullable(),
  sector: z.string().trim().max(64).optional().nullable(),
  region: z.string().trim().max(64).optional().nullable(),
  remote: z
    .union([z.boolean(), z.string()])
    .transform((v) =>
      typeof v === "boolean" ? v : ["true", "1", "yes", "y"].includes(v.toLowerCase()),
    )
    .default(false),
  url: z.string().trim().url().max(500).optional().nullable(),
  skills: z
    .string()
    .optional()
    .nullable()
    .transform((v) =>
      !v
        ? []
        : v
            .split(/[|;,]/)
            .map((s) => s.trim())
            .filter(Boolean),
    ),
});

export const learningRow = z.object({
  title: z.string().trim().min(1).max(255),
  provider: z.string().trim().max(255).optional().nullable(),
  language: z.string().trim().max(8).optional().nullable(),
  duration_h: z.coerce.number().min(0).optional().nullable(),
  cost: z.coerce.number().min(0).optional().nullable(),
  url: z.string().trim().url().max(500).optional().nullable(),
  skill_codes: z
    .string()
    .optional()
    .nullable()
    .transform((v) =>
      !v
        ? []
        : v
            .split(/[|;,]/)
            .map((s) => s.trim())
            .filter(Boolean),
    ),
});

export const KIND_META: Record<
  DatasetKind,
  {
    label: string;
    table: string;
    schema: z.ZodTypeAny;
    headers: string[];
    example: string;
  }
> = {
  taxonomy: {
    label: "Skills taxonomy (ESCO / O*NET)",
    table: "taxonomy_skills",
    schema: taxonomyRow,
    headers: ["code", "label", "source", "level", "parent_code"],
    example:
      "code,label,source,level,parent_code\nS1.0,Communication,ESCO,0,\nS1.1,Active listening,ESCO,1,S1.0\n",
  },
  occupations: {
    label: "Occupations (ISCO / automation risk)",
    table: "occupations",
    schema: occupationsRow,
    headers: ["code", "title", "isco_major", "automation_risk"],
    example:
      "code,title,isco_major,automation_risk\n2511,Systems analyst,2,0.21\n9112,Cleaner,9,0.69\n",
  },
  labor: {
    label: "Labor indicators (employment / wages)",
    table: "labor_indicators",
    schema: laborRow,
    headers: ["indicator_code", "year", "value", "age_band", "sex"],
    example:
      "indicator_code,year,value,age_band,sex\nUNEM_TOT,2024,5.4,15-64,total\nLFP_FEMALE,2024,38.1,15-64,female\n",
  },
  opportunities: {
    label: "Opportunities (jobs / gigs)",
    table: "opportunities",
    schema: opportunitiesRow,
    headers: ["title", "employer", "sector", "region", "remote", "url", "skills"],
    example:
      "title,employer,sector,region,remote,url,skills\nJunior data analyst,Acme,Tech,Lahore,false,https://example.com/job/1,sql|excel\n",
  },
  learning: {
    label: "Learning resources (courses)",
    table: "learning_resources",
    schema: learningRow,
    headers: ["title", "provider", "language", "duration_h", "cost", "url", "skill_codes"],
    example:
      "title,provider,language,duration_h,cost,url,skill_codes\nIntro to SQL,Coursera,en,12,0,https://example.com/sql,sql\n",
  },
};

/* ---- minimal RFC4180-compatible CSV parser (handles quotes, commas, newlines) ---- */

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && input[i + 1] === "\n") i++;
        row.push(cell);
        cell = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

export interface ParseResult<T> {
  ok: T[];
  errors: { line: number; message: string; raw: Record<string, string> }[];
  totalRows: number;
}

export function validateCsv<T>(
  csv: string,
  schema: z.ZodType<T>,
): ParseResult<T> {
  const rows = parseCsv(csv);
  if (rows.length === 0) {
    return { ok: [], errors: [], totalRows: 0 };
  }
  const headers = rows[0].map((h) => h.trim());
  const ok: T[] = [];
  const errors: ParseResult<T>["errors"] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = (r[idx] ?? "").trim();
    });
    const parsed = schema.safeParse(raw);
    if (parsed.success) {
      ok.push(parsed.data);
    } else {
      const msg = parsed.error.issues
        .map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`)
        .join("; ");
      errors.push({ line: i + 1, message: msg, raw });
    }
  }
  return { ok, errors, totalRows: rows.length - 1 };
}