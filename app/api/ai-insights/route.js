import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { data } = await request.json();
    
    // Analyze the data and generate insights
    const insights = generateGrowthInsights(data);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateGrowthInsights(data) {
  const {
    totalAds,
    totalSpend,
    totalPurchases,
    totalImpressions,
    totalClicks,
    account,
    topPerformingAds,
    videoVsImagePerformance
  } = data;

  // Calculate key metrics
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
  const overallCPA = totalPurchases > 0 ? (totalSpend / totalPurchases).toFixed(2) : 0;
  const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks * 100).toFixed(2) : 0;
  
  // Video vs Image analysis
  const videoROAS = videoVsImagePerformance.video.spend > 0 ? (videoVsImagePerformance.video.purchases / videoVsImagePerformance.video.spend * 100).toFixed(2) : 0;
  const imageROAS = videoVsImagePerformance.image.spend > 0 ? (videoVsImagePerformance.image.purchases / videoVsImagePerformance.image.spend * 100).toFixed(2) : 0;
  
  // Generate insights based on data analysis
  let insights = `🚀 GROWTH INSIGHTS FOR ${account.toUpperCase()}\n\n`;
  
  // Performance Overview
  insights += `📊 PERFORMANCE SNAPSHOT:\n`;
  insights += `• Total ad spend: ₹${Math.round(totalSpend).toLocaleString()}\n`;
  insights += `• Total purchases: ${totalPurchases.toLocaleString()}\n`;
  insights += `• Overall CTR: ${overallCTR}%\n`;
  insights += `• Cost per acquisition: ₹${overallCPA}\n`;
  insights += `• Conversion rate: ${conversionRate}%\n\n`;
  
  // Strategic Recommendations
  insights += `🎯 STRATEGIC RECOMMENDATIONS:\n\n`;
  
  // CTR Analysis
  if (parseFloat(overallCTR) < 1.0) {
    insights += `🔴 LOW CTR ALERT (${overallCTR}%):\n`;
    insights += `• Your CTR is below industry average (1.0%)\n`;
    insights += `• Consider A/B testing new creative formats\n`;
    insights += `• Refine audience targeting to improve relevance\n`;
    insights += `• Test different ad copy and value propositions\n\n`;
  } else if (parseFloat(overallCTR) >= 2.0) {
    insights += `🟢 EXCELLENT CTR (${overallCTR}%):\n`;
    insights += `• Your CTR is well above industry average!\n`;
    insights += `• Scale winning creatives to maximize reach\n`;
    insights += `• Consider lookalike audiences based on converters\n\n`;
  } else {
    insights += `🟡 MODERATE CTR (${overallCTR}%):\n`;
    insights += `• CTR is decent but has room for improvement\n`;
    insights += `• Test dynamic creative optimization\n`;
    insights += `• Experiment with different audience segments\n\n`;
  }
  
  // CPA Analysis
  if (parseFloat(overallCPA) > 500) {
    insights += `🔴 HIGH CPA CONCERN (₹${overallCPA}):\n`;
    insights += `• Your acquisition cost is quite high\n`;
    insights += `• Focus on conversion rate optimization\n`;
    insights += `• Review landing page experience\n`;
    insights += `• Consider retargeting campaigns for warm audiences\n\n`;
  } else if (parseFloat(overallCPA) < 100) {
    insights += `🟢 EXCELLENT CPA (₹${overallCPA}):\n`;
    insights += `• Your acquisition cost is very efficient!\n`;
    insights += `• Increase budget allocation to winning campaigns\n`;
    insights += `• Expand to similar audience segments\n\n`;
  }
  
  // Video vs Image Analysis
  if (videoVsImagePerformance.video.ads > 0 && videoVsImagePerformance.image.ads > 0) {
    insights += `🎬 VIDEO vs IMAGE PERFORMANCE:\n`;
    if (parseFloat(videoROAS) > parseFloat(imageROAS)) {
      insights += `• Video ads are outperforming (${videoROAS}% vs ${imageROAS}% ROAS)\n`;
      insights += `• Increase video ad budget by 20-30%\n`;
      insights += `• Create more engaging video content\n`;
      insights += `• Consider video storytelling formats\n\n`;
    } else {
      insights += `• Image ads are performing better (${imageROAS}% vs ${videoROAS}% ROAS)\n`;
      insights += `• Focus on high-quality static creatives\n`;
      insights += `• Test carousel and collection ad formats\n`;
      insights += `• Optimize image ad copy and CTAs\n\n`;
    }
  }
  
  // Top Performer Analysis
  if (topPerformingAds && topPerformingAds.length > 0) {
    insights += `🏆 TOP PERFORMING AD INSIGHTS:\n`;
    topPerformingAds.forEach((ad, index) => {
      const efficiency = ad.spend > 0 ? (ad.purchases / ad.spend * 100).toFixed(2) : 0;
      insights += `${index + 1}. ${ad.name.substring(0, 50)}...\n`;
      insights += `   • Purchases: ${ad.purchases} | Efficiency: ${efficiency}%\n`;
    });
    insights += `\n💡 OPTIMIZATION ACTIONS:\n`;
    insights += `• Scale budget on top-performing ads\n`;
    insights += `• Analyze winning creative elements\n`;
    insights += `• Create similar ads with variations\n`;
    insights += `• Pause underperforming ads to reallocate budget\n\n`;
  }
  
  // Growth Recommendations
  insights += `🚀 GROWTH ACCELERATION PLAN:\n`;
  insights += `• Implement automated bidding strategies\n`;
  insights += `• Set up conversion tracking optimization\n`;
  insights += `• Create customer journey-based ad sequences\n`;
  insights += `• Test new Gen AI features in ad creation\n`;
  insights += `• Develop retention campaigns for existing users\n\n`;
  
  // Account-specific recommendations
  if (account.includes('mms') || account.includes('lf')) {
    insights += `🎵 MUSIC APP SPECIFIC RECOMMENDATIONS:\n`;
    insights += `• Test music preview ads with audio\n`;
    insights += `• Target music enthusiasts and playlist creators\n`;
    insights += `• Use seasonal music trends for ad timing\n`;
    insights += `• Create ads showcasing app's AI music features\n`;
  } else if (account.includes('video') || account.includes('photo')) {
    insights += `📸 CREATIVE APP SPECIFIC RECOMMENDATIONS:\n`;
    insights += `• Showcase before/after transformations\n`;
    insights += `• Target creative professionals and content creators\n`;
    insights += `• Use trending visual styles in ads\n`;
    insights += `• Highlight AI-powered creative features\n`;
  }
  
  return insights;
}