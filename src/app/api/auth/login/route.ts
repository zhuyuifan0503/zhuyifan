import { NextResponse } from "next/server";
import { login, getAuthTokenCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
    }

    const valid = await login(password);
    if (!valid) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", getAuthTokenCookie(password));
    return response;
  } catch {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
