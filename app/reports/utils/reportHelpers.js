import { getActionValue, getPurchaseValue } from "../../utils/dateHelpers";

// Import country/platform detection functions
export const getCountryFromCampaignName = (campaignName) => {
  if (!campaignName) return "unknown";
  
  const name = campaignName.toLowerCase();
  
  // India detection
  if (name.includes("india") || name.includes("ind") || name.includes("in_") || 
      name.includes("mumbai") || name.includes("delhi") || name.includes("bangalore") ||
      name.includes("chennai") || name.includes("kolkata") || name.includes("pune") ||
      name.includes("hyderabad") || name.includes("ahmedabad") || name.includes("jaipur")) {
    return "india";
  } 
  
  // US detection
  if (name.includes("us") || name.includes("usa") || name.includes("united states") || 
      name.includes("america") || name.includes("new york") || name.includes("california") ||
      name.includes("texas") || name.includes("florida") || name.includes("chicago") ||
      name.includes("los angeles") || name.includes("boston") || name.includes("seattle")) {
    return "us";
  }
  
  return "unknown";
};

export const getPlatformFromCampaignName = (campaignName) => {
  if (!campaignName) return "unknown";
  
  const name = campaignName.toLowerCase();
  
  // Android detection
  if (name.includes("android") || name.includes("google play") || name.includes("playstore") || 
      name.includes("play store") || name.includes("gp_") || name.includes("_android") ||
      name.includes("droid") || name.includes("_gp")) {
    return "android";
  }
  
  // iOS detection  
  if (name.includes("ios") || name.includes("iphone") || name.includes("ipad") || 
      name.includes("app store") || name.includes("appstore") || name.includes("as_") ||
      name.includes("_ios") || name.includes("_as") || name.includes("apple")) {
    return "ios";
  }
  
  return "unknown";
};

// Function to group campaigns by region and platform
export const groupCampaignsByRegion = (campaigns, account) => {
  if (!campaigns.length) return {};

  // Initialize groups
  const groups = {
    overall: [],
    india: [],
    us: [],
    ...(account === "mms_af" && {
      india_android: [],
      india_ios: [],
      us_android: [],
      us_ios: []
    })
  };

  // Group campaigns by country and platform
  campaigns.forEach(campaign => {
    const country = getCountryFromCampaignName(campaign.campaign_name);
    const platform = getPlatformFromCampaignName(campaign.campaign_name);

    // Add to overall
    groups.overall.push(campaign);

    // Add to country-specific groups
    if (country === "india") {
      groups.india.push(campaign);
      
      // For MMS_AF, also add to platform-specific groups
      if (account === "mms_af") {
        if (platform === "android") {
          groups.india_android.push(campaign);
        } else if (platform === "ios") {
          groups.india_ios.push(campaign);
        }
      }
    } else if (country === "us") {
      groups.us.push(campaign);
      
      // For MMS_AF, also add to platform-specific groups
      if (account === "mms_af") {
        if (platform === "android") {
          groups.us_android.push(campaign);
        } else if (platform === "ios") {
          groups.us_ios.push(campaign);
        }
      }
    }
  });

  return groups;
};