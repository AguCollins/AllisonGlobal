import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "industry",
  resourceLabel: "industry",
  contentType: "industry",
});

export { GET, POST, PATCH, DELETE };
