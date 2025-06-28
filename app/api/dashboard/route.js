import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const datePreset = searchParams.get("date_preset") || "yesterday";

  try {
    const { data } = await axios.get(
      `http://api.videonation.xyz/api/v1/facebook-ads/dashboard`,
      {
        params: {
          date_preset: datePreset,
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
