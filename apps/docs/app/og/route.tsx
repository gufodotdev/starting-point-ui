import { ImageResponse } from "next/og";

const fonts = Promise.all([
  import("./inter-regular.json"),
  import("./inter-semibold.json"),
]).then(([regular, semibold]) => [
  { name: "Inter", data: Buffer.from(regular.base64Font, "base64"), weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: Buffer.from(semibold.base64Font, "base64"), weight: 600 as const, style: "normal" as const },
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Starting Point UI").slice(0, 120);
  const description = (searchParams.get("description") ?? "").slice(0, 300);

  return new ImageResponse(
    (
      <div tw="flex h-full w-full bg-black text-white" style={{ fontFamily: "Inter" }}>
        <div tw="flex absolute inset-y-0 left-16 w-[1px] border border-dashed border-neutral-700" />
        <div tw="flex absolute inset-y-0 right-16 w-[1px] border border-dashed border-neutral-700" />
        <div tw="flex absolute inset-x-0 top-16 h-[1px] border border-neutral-700" />
        <div tw="flex absolute inset-x-0 bottom-16 h-[1px] border border-neutral-700" />
        <div tw="flex absolute bottom-24 right-24">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={56} height={56}>
            <rect width="32" height="32" rx="7" fill="#e5e5e5" />
            <g transform="translate(5.333 5.333) scale(0.889)">
              <path d="M6.5 16.5 16.5 6.5" fill="none" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
              <circle cx="17" cy="17" r="2.5" fill="#171717" />
            </g>
          </svg>
        </div>
        <div tw="flex absolute inset-32 w-[896px] flex-col justify-center">
          <div
            tw="flex flex-col justify-center tracking-tight leading-[1.1]"
            style={{
              textWrap: "balance",
              fontWeight: 600,
              fontSize: title.length > 44 ? 56 : 64,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>
          {description ? (
            <div tw="mt-8 flex text-[36px] leading-[1.5] text-neutral-400" style={{ fontWeight: 400, textWrap: "pretty" }}>
              {description}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: await fonts,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}
