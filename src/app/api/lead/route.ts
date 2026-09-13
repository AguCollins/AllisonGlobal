import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const leadSchema = z.object({
  type: z.enum(["contact", "quote", "consultation", "assessment", "support"]),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  subject: z.string().optional().or(z.literal("")),
  services: z.array(z.string()).optional().default([]),
  budget: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Please tell us a bit more (at least 10 characters)"),
  // honeypot — must be empty
  website: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot: reject if filled
    if (body?.website && String(body.website).trim() !== "") {
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
        type: d.type,
        name: d.name.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone?.trim() || null,
        company: d.company?.trim() || null,
        industry: d.industry?.trim() || null,
        subject: d.subject?.trim() || null,
        services: (d.services ?? []).join(", ") || null,
        budget: d.budget?.trim() || null,
        timeline: d.timeline?.trim() || null,
        message: d.message.trim(),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        id: lead.id,
        message:
          "Thank you — your message has been received. Our team will get back to you shortly.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[lead] error", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't submit your message right now. Please try again or call us directly.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed." },
    { status: 405 },
  );
}
