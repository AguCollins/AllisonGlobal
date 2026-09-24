import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { services } from "@/lib/data/services";
import { industries } from "@/lib/data/industries";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const SERVICE_SLUGS = new Set(services.map((s) => s.slug));
const INDUSTRY_IDS = new Set(industries.map((i) => i.id));

const clean = (s: string): string => s.replace(/[\u0000-\u001F\u007F]/g, "").trim();

const leadSchema = z.object({
  type: z.enum(["contact", "quote", "consultation", "assessment", "support"]),
  name: z.string().min(2, "Please enter your name").max(120).transform(clean),
  email: z.string().email("Please enter a valid email").max(200).transform((v) => clean(v).toLowerCase()),
  phone: z.string().max(40).transform(clean).optional().or(z.literal("")),
  company: z.string().max(200).transform(clean).optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")).transform((v) => (v && INDUSTRY_IDS.has(v) ? v : null)),
  subject: z.string().max(200).transform(clean).optional().or(z.literal("")),
  services: z.array(z.string()).optional().transform((arr) => (arr ?? []).filter((s) => SERVICE_SLUGS.has(s))),
  budget: z.string().max(80).transform(clean).optional().or(z.literal("")),
  timeline: z.string().max(80).transform(clean).optional().or(z.literal("")),
  message: z.string().min(10, "Please tell us a bit more (at least 10 characters)").max(5000).transform(clean),
  website: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { limited } = await checkRateLimit(ip);
  if (limited) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 20_000) {
      return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body. Please send valid JSON." },
      { status: 400 },
    );
  }

  try {
    if (body && typeof body === "object" && "website" in body &&
        String((body as Record<string, unknown>).website ?? "").trim() !== "") {
      return NextResponse.json(
        { ok: true, message: "Thank you. Your message has been received." },
        { status: 200 },
      );
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, error: firstError?.message ?? "Invalid submission." },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const lead = await db.lead.create({
      data: {
        type: d.type, name: d.name, email: d.email,
        phone: d.phone || null, company: d.company || null,
        industry: d.industry || null, subject: d.subject || null,
        services: d.services.join(", ") || null,
        budget: d.budget || null, timeline: d.timeline || null,
        message: d.message,
      },
    });

    return NextResponse.json(
      { ok: true, id: lead.id, message: "Thank you — your message has been received. Our team will get back to you shortly." },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error("[lead] submission failed:", msg.slice(0, 200));
    return NextResponse.json(
      { ok: false, error: "We couldn't submit your message right now. Please try again or call us directly." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
