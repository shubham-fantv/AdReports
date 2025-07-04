"use client";
import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function VNPurchasePage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    date: '',
    revenue: ''
  });
  const [purchases, setPurchases] = useState([]);
  const [errors, setErrors] = useState({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPurchases = localStorage.getItem('vnPurchases');
    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    }
  }, []);

  // Save to localStorage whenever purchases change
  useEffect(() => {
    localStorage.setItem('vnPurchases', JSON.stringify(purchases));
  }, [purchases]);

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
      revenue: parseFloat(formData.revenue),
      createdAt: new Date().toISOString()
    };

    setPurchases(prev => [...prev, newPurchase]);
    
    // Reset form
    setFormData({
      date: '',
      revenue: ''
    });
  };

  const handleDelete = (id) => {
    setPurchases(prev => prev.filter(purchase => purchase.id !== id));
  };

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.revenue, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800 backdrop-blur-xl border-b border-white/20 dark:border-gray-700 sticky top-0 z-50 shadow-lg shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">VideoNation Purchase Tracker</h1>
                <p className="text-sm text-gray-700 dark:text-gray-200">Manage daily revenue entries</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-purple-500/20"
              >
                <span>← Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📝</span>
                </div>
                Add New Purchase Entry
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Record daily revenue data</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
                    errors.date 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 ${
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Add Purchase Entry
              </button>
            </form>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📊</span>
                </div>
                Purchase Records
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage revenue entries</p>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue (₹)</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
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
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(purchase.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{purchase.revenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDelete(purchase.id)}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total Row */}
                      <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900 dark:text-white">Total</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-gray-900 dark:text-white text-lg">
                            ₹{totalRevenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {purchases.length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{purchases.length > 0 ? (totalRevenue / purchases.length).toLocaleString() : '0'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Average Revenue</div>
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