import { createCrudHandlers } from "@/lib/crud";

export const dynamic = "force-dynamic";

const { GET, POST, PATCH, DELETE } = createCrudHandlers({
  model: "testimonial",
  resourceLabel: "testimonial",
  publicPaths: ["/testimonials", "/"],
});

export { GET, POST, PATCH, DELETE };
