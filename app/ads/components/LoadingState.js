"use client";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="text-gray-900 dark:text-white font-semibold">Loading Ads Data</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Please wait while we fetch your ad-level data...</p>
        </div>
      </div>
    </div>
  );
}