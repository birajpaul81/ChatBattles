import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Insert contact submission into Supabase
    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          status: "unread",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to submit contact form" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
        id: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve submissions (for admin dashboard)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabaseAdmin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by status if provided
    if (status && ["unread", "read", "replied", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissions: data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: PATCH endpoint to update submission status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    if (!["unread", "read", "replied", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
