import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { verifyPassword, encrypt, type SessionPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier: rawIdentifier, password } = await req.json();

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { error: "Usuario/Email y contraseña son obligatorios" },
        { status: 400 },
      );
    }

    const identifier = rawIdentifier.trim();

    await connectDB();

    // Accept login via email OR username
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const sessionData = {
      userId: user.id || (user._id ? user._id.toString() : undefined),
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar || undefined,
    };

    if (!sessionData.userId) {
      throw new Error("User ID is missing");
    }

    const sessionString = await encrypt(sessionData as SessionPayload);

    const response = NextResponse.json(
      { user: sessionData, success: true },
      { status: 200 },
    );

    // Set cookie with strict attributes
    response.cookies.set({
      name: "session",
      value: sessionString,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" || req.url.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
