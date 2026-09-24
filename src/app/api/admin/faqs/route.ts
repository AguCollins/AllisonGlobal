import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "faq",
  resourceLabel: "faq",
  publicPaths: ["/faqs", "/"],
});

export { GET, POST, PATCH, DELETE };
