import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET /api/subscription
 *
 * A thin server-side proxy so client components (Navbar, etc.) can check
 * subscription status without needing "use server" functions in useQuery.
 * The browser sends its cookies automatically; we forward them to the backend.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return NextResponse.json(null, { status: 200 });
    }

    const res = await fetch(`${BASE_API_URL}/payment/getSubscription`, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(null, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(null, { status: 200 });
  }
}
