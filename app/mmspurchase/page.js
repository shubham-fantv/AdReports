"use client";
import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const PRICING_PLANS = {
  US: {
    plan1: { name: "Basic", price: 9.99 },
    plan2: { name: "Standard", price: 19.99 },
    plan3: { name: "Premium", price: 29.99 }
  },
  India: {
    plan1: { name: "Basic", price: 299 },
    plan2: { name: "Standard", price: 599 },
    plan3: { name: "Premium", price: 899 }
  }
};

let MMS_PURCHASES_DATA = [
  {
    id: 1735862400000,
    date: "2025-01-02",
    country: "US",
    revenue: 1250.00,
    createdAt: "2025-01-02T10:00:00.000Z"
  },
  {
    id: 1735776000000,
    date: "2025-01-01",
    country: "India",
    revenue: 25000,
    createdAt: "2025-01-01T10:00:00.000Z"
  }
];

export default function MMSPurchasePage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    date: '',
    country: '',
    revenue: ''
  });
  const [purchases, setPurchases] = useState(MMS_PURCHASES_DATA);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.revenue) {
      newErrors.revenue = 'Revenue is required';
    } else if (isNaN(formData.revenue) || parseFloat(formData.revenue) < 0) {
      newErrors.revenue = 'Revenue must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newPurchase = {
      id: Date.now(),
      date: formData.date,
      country: formData.country,
      revenue: parseFloat(formData.revenue),
      createdAt: new Date().toISOString()
    };

    // Add to global data array
    MMS_PURCHASES_DATA.push(newPurchase);
    setPurchases([...MMS_PURCHASES_DATA]);
    
    // Reset form
    setFormData({
      date: '',
      country: '',
      revenue: ''
    });
  };

  const handleDelete = (id) => {
    // Remove from global data array
    MMS_PURCHASES_DATA = MMS_PURCHASES_DATA.filter(purchase => purchase.id !== id);
    setPurchases([...MMS_PURCHASES_DATA]);
  };

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.revenue, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/20 dark:border-[#2a2a2a] sticky top-0 z-50 shadow-lg shadow-purple-500/10 dark:shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-green-500 dark:to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-base sm:text-lg">📱</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">MMS Purchase Tracker</h1>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 hidden sm:block">Manage daily revenue entries</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <button
                onClick={() => (window.location.href = "/")}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg shadow-purple-500/20 text-sm sm:text-base min-h-[44px] sm:min-h-[auto]"
              >
                <span className="hidden sm:inline">← Dashboard</span>
                <span className="sm:hidden">←</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <span className="text-white text-xs sm:text-sm">📝</span>
                </div>
                Add New Purchase Entry
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Record daily revenue data</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Date Field */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm sm:text-base min-h-[44px] ${
                    errors.date 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                )}
              </div>

              {/* Country Field */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm sm:text-base min-h-[44px] ${
                    errors.country 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="India">India</option>
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>
                )}
              </div>

              {/* Revenue Field */}
              <div>
                <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Revenue (₹)
                </label>
                <input
                  type="number"
                  id="revenue"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleInputChange}
                  placeholder="Enter revenue amount"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-3 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm sm:text-base min-h-[44px] ${
                    errors.revenue 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.revenue && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.revenue}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base min-h-[44px]"
              >
                Add Purchase Entry
              </button>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <span className="text-white text-xs sm:text-sm">📊</span>
                </div>
                Purchase Records
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage revenue entries</p>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Purchase Records</h3>
                <p className="text-gray-600 dark:text-gray-400">Add your first revenue entry using the form</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Date</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Country</th>
                        <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Revenue (₹)</th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((purchase, index) => (
                        <tr 
                          key={purchase.id} 
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        >
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {new Date(purchase.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4">
                            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {purchase.country}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              ₹{purchase.revenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                            <button
                              onClick={() => handleDelete(purchase.id)}
                              className="px-2 py-1 sm:px-3 sm:py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 min-h-[32px] sm:min-h-[36px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total Row */}
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Total</span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4"></td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                          <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                            ₹{totalRevenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-0">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {purchases.length}
                      </div>
                      <div className="text-xs sm:text-xs text-gray-600 dark:text-gray-400">Total Entries</div>
                    </div>
                    <div className="text-center p-2 sm:p-0">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        ₹{totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-xs text-gray-600 dark:text-gray-400">Total Revenue</div>
                    </div>
                    <div className="text-center p-2 sm:p-0">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        ₹{purchases.length > 0 ? (totalRevenue / purchases.length).toLocaleString() : '0'}
                      </div>
                      <div className="text-xs sm:text-xs text-gray-600 dark:text-gray-400">Average Revenue</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}