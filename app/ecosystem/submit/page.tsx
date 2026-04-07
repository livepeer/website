import SubmitAppForm from "@/components/ecosystem/SubmitAppForm";
import { getEcosystemCategories } from "@/lib/ecosystem";

export default function SubmitAppPage() {
  const categories = getEcosystemCategories().filter((c) => c !== "All");
  return <SubmitAppForm categories={categories} />;
}
