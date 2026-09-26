import type { Metadata } from "next";
import { ProcessView } from "@/components/views/process-view";
import { DataError } from "@/components/site/data-error";
import {
  getProcessSteps,
  DatabaseUnavailableError,
  type ProcessStepRecord,
} from "@/lib/data-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "Every engagement follows an engineering-led path — from site assessment to design, supply, installation, commissioning and long-term support.",
};

export default async function Page() {
  let dbOk = true;
  let steps: ProcessStepRecord[] = [];

  try {
    steps = await getProcessSteps();
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      dbOk = false;
    } else {
      throw err;
    }
  }

  if (!dbOk) {
    return <DataError />;
  }

  if (!steps.length) {
    return (
      <DataError message="Process content is being updated. Please check back shortly." />
    );
  }

  return <ProcessView steps={steps} heroImage="" />;
}
