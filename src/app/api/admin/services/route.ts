import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "service",
  resourceLabel: "service",
  contentType: "service",
});

export { GET, POST, PATCH, DELETE };
