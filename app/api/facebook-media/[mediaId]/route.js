import axios from "axios";

// Helper function to check if account is MMS-type (mms or mms_af)
const isMmsAccount = (account) => account === "mms" || account === "mms_af";

export async function GET(req, { params }) {
  const { mediaId } = params;
  const { searchParams } = new URL(req.url);
  const account = searchParams.get("account") || "default";
  const mediaType = searchParams.get("type") || "image"; // 'image' or 'video'
  
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
  
  // Validate media ID
  if (!mediaId) {
    return new Response(
      JSON.stringify({ error: "Media ID is required" }),
      { status: 400 }
    );
  }
  
  try {
    console.log(`Making Facebook Graph API call for ${mediaType} ${mediaId} with account ${account}`);
    console.log(`Access token exists: ${!!accessToken}`);
    
    // Build the Facebook Graph API URL based on media type
    const fields = mediaType === 'video' ? 'source,permalink_url' : 'url';
    const url = `https://graph.facebook.com/v19.0/${mediaId}?access_token=${accessToken}&fields=${fields}`;
    console.log(`Facebook Graph API URL: ${url.replace(accessToken, '***')}`);
    
    const { data } = await axios.get(url);
    console.log(`Facebook Graph API call successful for ${mediaType} ${mediaId}!`);
    console.log(`API response:`, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const accountType = account === "mms" ? "MMS" : account === "mms_af" ? "MMS_AF" : account === "lf_af" ? "LF_AF" : account === "videonation_af" ? "VideoNation_AF" : "VideoNation";
    console.error(`Error fetching ${mediaType} data for ${mediaId} (${accountType}):`, error.message);
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
          error: `Facebook API error for ${accountType} ${mediaType} ${mediaId}: ${error.response.data.error.message}` 
        }),
        { status: error.response.status || 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: `Failed to fetch ${mediaType} data for ${mediaId} (${accountType}): ${error.message}` 
      }),
      { status: 500 }
    );
  }
}