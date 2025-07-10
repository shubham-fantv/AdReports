"use client";
import { useEffect, useState } from "react";
import { getTodayIST, getISTDate, formatDateString } from "../utils/dateHelpers";
import { subDays } from 'date-fns';
import AdsHeader from './components/AdsHeader';
import AdsFilters from './components/AdsFilters';
import LoadingState from './components/LoadingState';
import AdsTable from './components/AdsTable';
import AdsAggregateCards from './components/AdsAggregateCards';

export default function AdsPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Filter state
  const [selectedAccount, setSelectedAccount] = useState("mms_af");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [activeRange, setActiveRange] = useState("L7");
  
  // Data state
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check for existing authentication on page load
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      window.location.href = '/';
    }
  }, []);

  // Initialize default date range to L7 (last 7 days)
  useEffect(() => {
    if (isAuthenticated) {
      // Set L7 (last 7 days) as default using IST
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const istNow = new Date(now.getTime() + istOffset);
      
      const endDate = formatDateString(istNow);
      const startDate = formatDateString(subDays(istNow, 7));
      
      setDailyStartDate(startDate);
      setDailyEndDate(endDate);
      setActiveRange("L7");
      
      // Fetch initial data
      fetchAdsData(startDate, endDate);
    }
  }, [isAuthenticated]);

  // Watch for account changes and refetch data
  useEffect(() => {
    if (isAuthenticated && dailyStartDate && dailyEndDate) {
      console.log(`Account changed to: ${selectedAccount}, refetching ads data`);
      fetchAdsData();
    }
  }, [selectedAccount]);

  const handleQuickDateRange = (days, rangeKey) => {
    // Get current date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istNow = new Date(now.getTime() + istOffset);
    
    let endDate, startDate;
    
    if (days === 0) {
      // L0 means today only
      endDate = formatDateString(istNow);
      startDate = formatDateString(istNow);
    } else {
      // Calculate start date by subtracting days
      endDate = formatDateString(istNow);
      startDate = formatDateString(subDays(istNow, days));
    }
    
    // Set the dates and active range
    setDailyStartDate(startDate);
    setDailyEndDate(endDate);
    setActiveRange(rangeKey);
    
    // Fetch data immediately with the new date range
    fetchAdsData(startDate, endDate);
  };

  const fetchAdsData = async (startDate = null, endDate = null, account = null) => {
    setLoading(true);
    
    const startDateStr = startDate || dailyStartDate;
    const endDateStr = endDate || dailyEndDate;
    const accountToUse = account || selectedAccount;
    
    if (!startDateStr || !endDateStr) {
      console.error("Invalid dates:", { startDateStr, endDateStr });
      setLoading(false);
      return;
    }
    
    try {
      // Generate array of dates in the range
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const dateArray = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateArray.push(d.toISOString().split('T')[0]);
      }
      
      console.log(`📅 Step 1: Making parallel API calls for ad performance data for dates: ${dateArray.join(', ')}`);
      console.log(`🔍 Selected Account for API calls: ${accountToUse}`);
      
      // Step 1: Get Ad Performance for each date with per_day=false
      const performancePromises = dateArray.map(date => {
        const params = new URLSearchParams({
          start_date: date,
          end_date: date,
          per_day: "false",
          account: accountToUse,
          level: "ad",
          fields: "ad_id,ad_name,impressions,clicks,spend,ctr,cpc,actions"
        });
        
        console.log(`🔗 Performance API URL for ${date} (Account: ${accountToUse}): /api/daily-reports?${params.toString()}`);
        return fetch(`/api/daily-reports?${params}`).then(res => res.json());
      });
      
      const performanceResults = await Promise.all(performancePromises);
      
      // Combine all performance data from different dates
      let allAdsData = [];
      const uniqueAdIds = new Set();
      
      performanceResults.forEach((result, index) => {
        if (result?.data?.campaigns) {
          const dateData = result.data.campaigns.map(ad => {
            uniqueAdIds.add(ad.ad_id);
            return {
              ...ad,
              date: dateArray[index]
            };
          });
          allAdsData = allAdsData.concat(dateData);
        }
      });
      
      console.log(`📊 Step 1 Complete: Got performance data for ${allAdsData.length} ad entries`);
      console.log(`🎯 Step 2: Getting creative details for ${uniqueAdIds.size} unique ads`);
      
      // Set intermediate state with performance data only first
      setAdsData(allAdsData);
      
      // Step 2: Get Creative Details for each unique ad using direct Facebook Graph API  
      const creativePromises = Array.from(uniqueAdIds).map(async (adId) => {
        // Wait a bit between calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Ad ID goes in the API path, not as a parameter
        const url = `/api/facebook-graph/${adId}?account=${accountToUse}&fields=adcreatives{id,name,object_story_spec,asset_feed_spec,effective_object_story_id}`;
        
        console.log(`🎨 Creative API URL for ad ${adId} (Account: ${accountToUse}): ${url}`);
        try {
          const response = await fetch(url);
          const result = await response.json();
          
          // Step 3: For each creative, fetch media URLs if available
          let mediaUrls = {};
          const creativeData = result?.data?.adcreatives?.data?.[0];
          
          if (creativeData) {
            // Check for video in object_story_spec
            if (creativeData.object_story_spec?.video_data?.video_id) {
              const videoId = creativeData.object_story_spec.video_data.video_id;
              try {
                const mediaResponse = await fetch(`/api/facebook-media/${videoId}?account=${accountToUse}&type=video`);
                const mediaResult = await mediaResponse.json();
                if (mediaResult?.data?.source) {
                  mediaUrls.videoSource = mediaResult.data.source;
                }
              } catch (error) {
                console.error(`Error fetching video source for ${videoId}:`, error);
              }
            }
            
            // Check for videos in asset_feed_spec (DPA)
            if (creativeData.asset_feed_spec?.videos?.length > 0) {
              const video = creativeData.asset_feed_spec.videos[0];
              if (video.video_id) {
                try {
                  const mediaResponse = await fetch(`/api/facebook-media/${video.video_id}?account=${accountToUse}&type=video`);
                  const mediaResult = await mediaResponse.json();
                  
                  console.log(`DPA Video fetch result for ${video.video_id} on account ${accountToUse}:`, mediaResult);
                  
                  // If successful, use the video source
                  if (mediaResult?.data?.source) {
                    mediaUrls.videoSource = mediaResult.data.source;
                    console.log(`✅ DPA Video source found for ${video.video_id}:`, mediaResult.data.source);
                  } else {
                    console.warn(`❌ No video source found for ${video.video_id} on account ${accountToUse}`, mediaResult);
                  }
                } catch (error) {
                  console.error(`Error fetching DPA video source for ${video.video_id}:`, error);
                }
              }
            }
            
            // Check for effective_object_story_id for DPA image attachments
            if (creativeData.effective_object_story_id) {
              try {
                const postResponse = await fetch(`/api/facebook-post/${creativeData.effective_object_story_id}?account=${accountToUse}`);
                const postResult = await postResponse.json();
                if (postResult?.data?.attachments?.data?.[0]?.media?.image?.src) {
                  mediaUrls.imageSource = postResult.data.attachments.data[0].media.image.src;
                }
              } catch (error) {
                console.error(`Error fetching DPA post attachments for ${creativeData.effective_object_story_id}:`, error);
              }
            }
          }
          
          return { adId, creative: result, mediaUrls };
        } catch (error) {
          console.error(`Error fetching creative for ad ${adId}:`, error);
          return { adId, creative: null, mediaUrls: {} };
        }
      });
      
      const creativeResults = await Promise.all(creativePromises);
      
      // Create a map of ad_id to creative data
      const creativeMap = {};
      const mediaUrlsMap = {};
      creativeResults.forEach(({ adId, creative, mediaUrls }) => {
        if (creative?.data?.adcreatives?.data?.[0]) {
          creativeMap[adId] = creative.data.adcreatives.data[0];
          mediaUrlsMap[adId] = mediaUrls || {};
        } else {
          creativeMap[adId] = null;
          mediaUrlsMap[adId] = {};
        }
      });
      
      // Combine performance data with creative details
      const finalAdsData = allAdsData.map(ad => {
        const creativeData = creativeMap[ad.ad_id];
        const mediaUrls = mediaUrlsMap[ad.ad_id] || {};
        const objectStorySpec = creativeData?.object_story_spec;
        const linkData = objectStorySpec?.link_data;
        const videoData = objectStorySpec?.video_data;
        
        // Handle different creative types (link_data vs video_data vs DPA)
        let creativeName = 'N/A';
        let creativeDescription = 'N/A';
        let creativeLink = 'N/A';
        let assetType = 'Unknown';
        let assetLink = 'N/A';
        let imageUrl = 'N/A';
        let videoUrl = 'N/A';
        
        if (linkData) {
          // For link/image ads
          creativeName = linkData.name || creativeData?.name || 'N/A';
          creativeDescription = linkData.description || linkData.message || 'N/A';
          creativeLink = linkData.link || 'N/A';
          assetType = linkData.image_hash ? 'Image Ad' : 'Link Ad';
          if (linkData.image_hash) {
            assetLink = `/api/facebook-media/${linkData.image_hash}?account=${accountToUse}&type=image`;
          }
        } else if (videoData) {
          // For video ads - use the creative name and extract description from other fields
          creativeName = creativeData?.name || 'N/A';
          creativeDescription = 'Video Ad';
          creativeLink = videoData.call_to_action?.value?.link || 'N/A';
          assetType = 'Video Ad';
          
          // Use the fetched video source URL directly
          if (mediaUrls.videoSource) {
            assetLink = mediaUrls.videoSource;
            videoUrl = mediaUrls.videoSource;
          } else if (videoData.video_id) {
            assetLink = `/api/facebook-media/${videoData.video_id}?account=${accountToUse}&type=video`;
          }
          
          if (videoData.image_url) {
            imageUrl = videoData.image_url;
          }
        } else if (creativeData?.asset_feed_spec) {
          // For Dynamic Product Ads (DPA) - handle template-based creatives
          const assetSpec = creativeData.asset_feed_spec;
          creativeName = creativeData?.name || 'N/A';
          
          // Extract titles and bodies from asset_feed_spec
          const titles = assetSpec.titles || [];
          const bodies = assetSpec.bodies || [];
          const linkUrls = assetSpec.link_urls || [];
          
          if (titles.length > 0) {
            creativeName = titles[0].text || creativeData?.name || 'N/A';
          }
          if (bodies.length > 0) {
            creativeDescription = bodies[0].text || 'Dynamic Product Ad';
          } else {
            creativeDescription = 'Dynamic Product Ad';
          }
          if (linkUrls.length > 0) {
            creativeLink = linkUrls[0].website_url || 'N/A';
          }
          
          // Determine asset type and extract media URLs based on what's available
          if (assetSpec.videos && assetSpec.videos.length > 0) {
            assetType = 'DPA Video';
            const video = assetSpec.videos[0];
            
            // Use the fetched video source URL directly
            if (mediaUrls.videoSource) {
              assetLink = mediaUrls.videoSource;
              videoUrl = mediaUrls.videoSource;
            } else if (video.video_id) {
              // If we couldn't fetch the video source, provide fallback API link
              assetLink = `/api/facebook-media/${video.video_id}?account=${accountToUse}&type=video`;
              videoUrl = `/api/facebook-media/${video.video_id}?account=${accountToUse}&type=video`;
            }
            
            if (video.thumbnail_url) {
              imageUrl = video.thumbnail_url;
            }
          } else {
            // Check if we have image data from effective_object_story_id
            if (mediaUrls.imageSource) {
              assetType = 'DPA Image';
              assetLink = mediaUrls.imageSource;
              imageUrl = mediaUrls.imageSource;
            } else {
              assetType = 'DPA';
            }
          }
        } else {
          // Fallback to creative name
          creativeName = creativeData?.name || 'N/A';
          assetType = 'Static';
        }
        
        // Store effective_object_story_id for potential future use
        const effectiveStoryId = creativeData?.effective_object_story_id;
        
        return {
          ...ad,
          creative: creativeData || null,
          creativeName,
          creativeDescription,
          creativeLink,
          creativeId: creativeData?.id || 'N/A',
          effectiveStoryId: effectiveStoryId || 'N/A',
          assetType,
          assetLink,
          imageUrl,
          videoUrl
        };
      });
      
      // Aggregate data by ad_id across the date range
      const aggregatedData = {};
      
      finalAdsData.forEach(ad => {
        const adId = ad.ad_id;
        
        if (!aggregatedData[adId]) {
          // Initialize with first occurrence data
          aggregatedData[adId] = {
            ...ad,
            // Initialize aggregatable metrics
            impressions: 0,
            clicks: 0,
            spend: 0,
            purchases: 0,
            dateRange: `${startDateStr} to ${endDateStr}`,
            dates: []
          };
        }
        
        // Extract purchases from actions
        let purchases = 0;
        if (ad.actions && Array.isArray(ad.actions)) {
          const purchaseAction = ad.actions.find(action => action.action_type === 'purchase');
          if (purchaseAction) {
            purchases = parseInt(purchaseAction.value || 0);
          }
        }
        
        // Aggregate metrics
        aggregatedData[adId].impressions += parseInt(ad.impressions || 0);
        aggregatedData[adId].clicks += parseInt(ad.clicks || 0);
        aggregatedData[adId].spend += parseFloat(ad.spend || 0);
        aggregatedData[adId].purchases += purchases;
        aggregatedData[adId].dates.push(ad.date);
        
        // Keep the latest creative data (in case it varies by date)
        if (ad.creative) {
          aggregatedData[adId].creative = ad.creative;
          aggregatedData[adId].creativeName = ad.creativeName;
          aggregatedData[adId].creativeDescription = ad.creativeDescription;
          aggregatedData[adId].creativeLink = ad.creativeLink;
          aggregatedData[adId].assetType = ad.assetType;
          aggregatedData[adId].assetLink = ad.assetLink;
          aggregatedData[adId].imageUrl = ad.imageUrl;
          aggregatedData[adId].videoUrl = ad.videoUrl;
        }
      });
      
      // Convert back to array and recalculate derived metrics
      const aggregatedAdsData = Object.values(aggregatedData).map(ad => ({
        ...ad,
        // Recalculate CTR, CPC, and CPA based on aggregated data
        ctr: ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0',
        cpc: ad.clicks > 0 ? (ad.spend / ad.clicks).toFixed(2) : '0',
        cpa: ad.purchases > 0 ? (ad.spend / ad.purchases).toFixed(2) : '0',
        date: ad.dateRange,
        // Add count of days this ad ran
        daysActive: ad.dates.length
      }));
      
      console.log("🎉 Final aggregated ads data with creatives:", aggregatedAdsData);
      setAdsData(aggregatedAdsData);
      
    } catch (error) {
      console.error("Error fetching ads data:", error);
      setAdsData([]);
    }
    
    setLoading(false);
  };

  const handleApplyDates = () => {
    setActiveRange("custom");
    fetchAdsData();
  };

  const handleAccountChange = (e) => {
    const newAccount = e.target.value;
    setSelectedAccount(newAccount);
    setAdsData([]);
    // Re-fetch data with new account - pass the new account value directly
    if (dailyStartDate && dailyEndDate) {
      fetchAdsData(null, null, newAccount);
    }
  };

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-[#0a0a0a] transition-colors duration-300">
      <AdsHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdsFilters
          selectedAccount={selectedAccount}
          onAccountChange={handleAccountChange}
          dailyStartDate={dailyStartDate}
          setDailyStartDate={setDailyStartDate}
          dailyEndDate={dailyEndDate}
          setDailyEndDate={setDailyEndDate}
          activeRange={activeRange}
          onQuickDateRange={handleQuickDateRange}
          onApplyDates={handleApplyDates}
        />

        {loading && <LoadingState />}

        {!loading && (
          <>
            <AdsAggregateCards adsData={adsData} selectedAccount={selectedAccount} />
            <AdsTable adsData={adsData} selectedAccount={selectedAccount} />
          </>
        )}
      </main>
    </div>
  );
}