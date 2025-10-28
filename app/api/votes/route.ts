import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// POST - Save or update a vote
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, model, voteType } = await req.json();

    if (!chatId || !model || !voteType) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, model, voteType" },
        { status: 400 }
      );
    }

    if (!["up", "down"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid vote type. Must be 'up' or 'down'" },
        { status: 400 }
      );
    }

    // Check if user already voted for this model in this chat
    const { data: existingVote } = await supabaseAdmin
      .from("votes")
      .select("*")
      .eq("user_id", userId)
      .eq("chat_id", chatId)
      .eq("model", model)
      .single();

    if (existingVote) {
      // Update existing vote
      const { data, error } = await supabaseAdmin
        .from("votes")
        .update({ vote_type: voteType })
        .eq("id", existingVote.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data, updated: true });
    } else {
      // Insert new vote
      const { data, error } = await supabaseAdmin
        .from("votes")
        .insert({
          user_id: userId,
          chat_id: chatId,
          model,
          vote_type: voteType,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data, updated: false });
    }
  } catch (error: any) {
    console.error("Error saving vote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get vote statistics
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const model = searchParams.get("model");
    const chatId = searchParams.get("chatId");
    const userId = searchParams.get("userId");

    let query = supabaseAdmin
      .from("votes")
      .select("model, vote_type, user_id, chat_id, created_at");

    if (model) {
      query = query.eq("model", model);
    }
    if (chatId) {
      query = query.eq("chat_id", chatId);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Calculate statistics per model
    const stats: Record<string, { 
      up: number; 
      down: number; 
      total: number;
      score: number; // up - down
      percentage: number; // (up / total) * 100
    }> = {};
    
    data.forEach((vote: any) => {
      if (!stats[vote.model]) {
        stats[vote.model] = { up: 0, down: 0, total: 0, score: 0, percentage: 0 };
      }
      if (vote.vote_type === 'up') {
        stats[vote.model].up++;
      } else {
        stats[vote.model].down++;
      }
      stats[vote.model].total++;
    });

    // Calculate score and percentage for each model
    Object.keys(stats).forEach(model => {
      stats[model].score = stats[model].up - stats[model].down;
      stats[model].percentage = stats[model].total > 0 
        ? Math.round((stats[model].up / stats[model].total) * 100)
        : 0;
    });

    // Sort models by score (highest first)
    const sortedStats = Object.entries(stats)
      .sort(([, a], [, b]) => b.score - a.score)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as typeof stats);

    return NextResponse.json({ 
      success: true, 
      stats: sortedStats,
      totalVotes: data.length 
    });
  } catch (error: any) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a vote
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const voteId = searchParams.get("id");
    const chatId = searchParams.get("chatId");
    const model = searchParams.get("model");

    let query = supabaseAdmin
      .from("votes")
      .delete()
      .eq("user_id", userId);

    if (voteId) {
      query = query.eq("id", voteId);
    } else if (chatId && model) {
      query = query.eq("chat_id", chatId).eq("model", model);
    } else {
      return NextResponse.json(
        { error: "Must provide either voteId or both chatId and model" },
        { status: 400 }
      );
    }

    const { error } = await query;
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting vote:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
