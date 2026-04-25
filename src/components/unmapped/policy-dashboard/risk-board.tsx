import * as React from "react";
import type { RiskDataset } from "./risk-data";

interface Props {
  data: RiskDataset;
}

export function RiskBoard({ data }: Props) {
  return <div>Risk Board stub: {data.occupations.length} occupations</div>;
}
