import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  console.log(
    `GET request to /api/trpc - pathname: ${url.pathname}, search: ${url.search}`,
  );
  return NextResponse.json({
    message: "tRPC GET route works",
    pathname: url.pathname,
    search: url.search,
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  console.log(
    `POST request to /api/trpc - pathname: ${url.pathname}, search: ${url.search}`,
  );
  const body = await req.text();
  console.log(`POST body: ${body}`);
  return NextResponse.json({
    message: "tRPC POST route works",
    pathname: url.pathname,
    search: url.search,
    body: body,
  });
}
