import { fetchProtocolStats } from "@/lib/subgraph";
import TokenPageContent from "./TokenPageContent";

export default async function TokenPage() {
  const stats = await fetchProtocolStats();
  return <TokenPageContent stats={stats} />;
}
