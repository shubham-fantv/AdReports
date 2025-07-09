import axios from "axios";

// Helper function to check if account is MMS-type (mms or mms_af)
const isMmsAccount = (account) => account === "mms" || account === "mms_af";

export async function GET(req, { params }) {
  const { adId } = params;
  const { searchParams } = new URL(req.url);
  const account = searchParams.get("account") || "default";
  const fields = searchParams.get("fields") || "adcreatives{id,name,object_story_spec,asset_feed_spec,effective_object_story_id}";
  
  // Select credentials based on account
  const accessToken = account === "mms" 
    ? process.env.FACEBOOK_MMS_ACCESS_TOKEN
    : account === "mms_af"
    ? process.env.FACEBOOK_MMS_ACCESS_TOKEN_AF
    : account === "lf_af"
    ? process.env.FACEBOOK_LF_ACCESS_TOKEN_AF
    : account === "videonation_af"
    ? process.env.FACEBOOK_ACCESS_TOKEN_VIDEONATION_AF
    : process.env.FACEBOOK_ACCESS_TOKEN_VIDEONATION;
  
  // Validate credentials exist
  if (!accessToken) {
    const accountType = account === "mms" ? "MMS" : account === "mms_af" ? "MMS_AF" : account === "lf_af" ? "LF_AF" : account === "videonation_af" ? "VideoNation_AF" : "VideoNation";
    return new Response(
      JSON.stringify({ 
        error: `Missing ${accountType} access token. Please check environment variables.` 
      }),
      { status: 500 }
    );
  }
  
  // Validate ad ID
  if (!adId) {
    return new Response(
      JSON.stringify({ error: "Ad ID is required" }),
      { status: 400 }
    );
  }
  
  try {
    console.log(`Making Facebook Graph API call for ad ${adId} with account ${account}`);
    console.log(`Access token exists: ${!!accessToken}`);
    console.log(`Fields: ${fields}`);
    
    // Build the Facebook Graph API URL
    const url = `https://graph.facebook.com/v19.0/${adId}?access_token=${accessToken}&fields=${encodeURIComponent(fields)}`;
    console.log(`Facebook Graph API URL: ${url.replace(accessToken, '***')}`);
    
    const { data } = await axios.get(url);
    console.log(`Facebook Graph API call successful for ad ${adId}!`);
    console.log(`API response:`, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const accountType = account === "mms" ? "MMS" : account === "mms_af" ? "MMS_AF" : account === "lf_af" ? "LF_AF" : account === "videonation_af" ? "VideoNation_AF" : "VideoNation";
    console.error(`Error fetching creative data for ad ${adId} (${accountType}):`, error.message);
    console.error(`Error details:`, error.response?.data || error);
    
    // Check if it's an authentication error
    if (error.response?.status === 401 || error.message.includes('Invalid access token')) {
      return new Response(
        JSON.stringify({ 
          error: `${accountType} access token is invalid or expired. Please check credentials.` 
        }),
        { status: 401 }
      );
    }
    
    // Check for other Facebook API errors
    if (error.response?.data?.error) {
      return new Response(
        JSON.stringify({ 
          error: `Facebook API error for ${accountType} ad ${adId}: ${error.response.data.error.message}` 
        }),
        { status: error.response.status || 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: `Failed to fetch creative data for ad ${adId} (${accountType}): ${error.message}` 
      }),
      { status: 500 }
    );
  }
}