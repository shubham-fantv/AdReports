import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const datePreset = searchParams.get("date_preset") || "yesterday";
  const account = searchParams.get("account") || "default";
  const level = searchParams.get("level") || "account";
  const fields = searchParams.get("fields");

  try {
    console.log("buddy", process.env.NEXT_PUBLIC_API_URL)
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/facebook-ads/dashboard`,
      {
        params: {
          date_preset: datePreset,
          account: account,
          level: level,
          ...(fields && { fields: fields })
        },
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzQxOTI3MGRiYjU5M2FmNDc3NjZiNiIsIm5hbWUiOiJIaW1hbnNodSBKYWluIiwiaWF0IjoxNzQ5NzI0NzU5fQ.OnleWnLm_aXWHrgG3QLwTOAhOhz76Kjtive1ZQboSNw`,
          "Content-Type": "application/json",
        },
      }
    );

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch dashboard data" }),
      { status: 500 }
    );
  }
}
