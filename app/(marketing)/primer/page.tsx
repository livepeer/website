import { fetchProtocolStats } from "@/lib/subgraph";
import PrimerContent from "@/components/primer/PrimerContent";

export default async function PrimerPage() {
  const stats = await fetchProtocolStats();
  return <PrimerContent stats={stats} />;
}
