import { NextRequest, NextResponse } from "next/server";
import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import type Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt, buildImagePrompt } from "@/lib/prompts";

const anthropic = new AnthropicBedrock({
  awsRegion: process.env.AWS_REGION || "us-east-1",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, image } = body as { text?: string; image?: string };

    if (!text && !image) {
      return NextResponse.json(
        { error: "Either text or image is required" },
        { status: 400 }
      );
    }

    const userContent: Anthropic.Messages.ContentBlockParam[] = [];

    if (image) {
      // Extract media type and data from base64 data URL
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: match[2],
          },
        });
      }
      userContent.push({ type: "text", text: buildImagePrompt() });
    } else if (text) {
      userContent.push({ type: "text", text: buildUserPrompt(text) });
    }

    const message = await anthropic.messages.create({
      model: "us.anthropic.claude-sonnet-4-20250514-v1:0",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    // Extract text content from response
    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { text: string }).text)
      .join("");

    // Parse and validate JSON
    let parsed;
    try {
      let cleaned = responseText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as valid JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Parse API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
