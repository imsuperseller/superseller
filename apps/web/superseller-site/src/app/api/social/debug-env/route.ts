import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    FB_PAGE_TOKEN_RENSTO: process.env.FB_PAGE_TOKEN_RENSTO ? `${process.env.FB_PAGE_TOKEN_RENSTO.slice(0,10)}...len=${process.env.FB_PAGE_TOKEN_RENSTO.length}` : "NOT SET",
    IG_BUSINESS_ACCOUNT_ID_RENSTO: process.env.IG_BUSINESS_ACCOUNT_ID_RENSTO || "NOT SET",
    FB_PAGE_TOKEN_SUPERSELLER: process.env.FB_PAGE_TOKEN_SUPERSELLER ? `${process.env.FB_PAGE_TOKEN_SUPERSELLER.slice(0,10)}...len=${process.env.FB_PAGE_TOKEN_SUPERSELLER.length}` : "NOT SET",
    FB_APP_ID: process.env.FB_APP_ID || "NOT SET",
    FB_APP_SECRET: process.env.FB_APP_SECRET ? "SET" : "NOT SET",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "SET" : "NOT SET",
  });
}
