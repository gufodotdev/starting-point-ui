import { allExamplesMeta } from "@/lib/examples";
import { Examples } from "@/components/examples";

export const metadata = {
  title: allExamplesMeta.title,
  description: allExamplesMeta.description,
};

export default function AllExamplesPage() {
  return <Examples />;
}
