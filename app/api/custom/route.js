import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const account = searchParams.get("account") || "default";
  const level = searchParams.get("level") || "account";
  const fields = searchParams.get("fields");

  try {
    console.log("buddy", process.env.NEXT_PUBLIC_API_URL)
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/facebook-ads/custom-date`,
      {
        params: {
          start_date: startDate || "2025-05-01",
          end_date: endDate || "2025-05-10",
          level: level,
          account: account,
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
    console.error("Error fetching custom-date data:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch custom-date data" }),
      { status: 500 }
    );
  }
}
