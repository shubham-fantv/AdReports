import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { chartData } = await req.json();
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "xyz") {
      return new Response(
        JSON.stringify({ 
          analysis: "Gemini API key not configured. Please add your actual API key to analyze the data." 
        }),
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Format the data for analysis
    const dataForAnalysis = chartData.map(item => ({
      date: item.date_start,
      spend: parseFloat(item.spend || 0),
      impressions: parseInt(item.impressions || 0),
      clicks: parseInt(item.clicks || 0),
      ctr: parseFloat(item.ctr || 0),
      cpc: parseFloat(item.cpc || 0),
      cpm: parseFloat(item.cpm || 0),
      purchases: item.actions?.find(a => a.action_type === 'purchase')?.value || 0,
      addToCart: item.actions?.find(a => a.action_type === 'add_to_cart')?.value || 0,
      initiateCheckout: item.actions?.find(a => a.action_type === 'initiate_checkout')?.value || 0,
      completeRegistration: item.actions?.find(a => a.action_type === 'complete_registration')?.value || 0
    }));

    const prompt = `
    Analyze this Facebook Ads data and provide exactly 5 concise key insights:

    Data: ${JSON.stringify(dataForAnalysis, null, 2)}

    Important: All spend amounts are in INR (Indian Rupees).

    Requirements:
    - Maximum 5 bullet points only
    - Each point should be 1-2 sentences maximum
    - Focus on actionable insights
    - Include specific numbers/percentages when relevant
    - Use INR for all monetary references
    - Prioritize the most important findings

    Format as:
    • Point 1
    • Point 2
    • Point 3
    • Point 4
    • Point 5
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error analyzing data:", error);
    return new Response(
      JSON.stringify({ 
        analysis: "Error occurred while analyzing the data. Please try again." 
      }),
      { status: 500 }
    );
  }
}