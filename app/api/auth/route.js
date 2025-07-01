export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    const validUsername = process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;
    
    if (username === validUsername && password === validPassword) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Authentication failed" }),
      { status: 500 }
    );
  }
}