import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[\w-]{8,16}$/.test(id)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const res = await fetch(`https://unsplash.com/photos/${id}/download`, {
    redirect: "follow",
  });
  res.body?.cancel();

  const url = new URL(res.url);
  if (!res.ok || !/(^|\.)unsplash\.com$/.test(url.hostname)) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const ixid = url.searchParams.get("ixid");
  return NextResponse.json({
    base: url.origin + url.pathname + (ixid ? `?ixid=${ixid}` : ""),
  });
}
