import { NextResponse } from "next/server"

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, username, email, password } = body

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username || `${firstName}.${lastName}`.toLowerCase(),
        email,
        password,
      }),
    })

    const data = await res.json()

    if (res.status >= 400) {
      return NextResponse.json(
        { message: data.detail || "Registration failed" },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
