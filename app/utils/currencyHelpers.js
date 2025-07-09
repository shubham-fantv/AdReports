// Currency configuration for different accounts
const CURRENCY_CONFIG = {
  // Accounts already in INR (NO conversion needed)
  "default": { currency: "INR", rate: 1 },    // VideoNation - already INR
  "mms": { currency: "INR", rate: 1 },        // MMS - already INR
  
  // Accounts needing conversion to INR
  "mms_af": { currency: "AED", rate: 23 },    // MMS_AF: 1 AED = 23 INR
  "lf_af": { currency: "AED", rate: 23 },     // LF_AF: 1 AED = 23 INR
  "videonation_af": { currency: "AED", rate: 23 },  // VideoNation_AF: 1 AED = 23 INR
  "photonation_af": { currency: "AED", rate: 23 },  // PhotoNation_AF: 1 AED = 23 INR
  
  // Future accounts can be added here:
  // "new_account_usd": { currency: "USD", rate: 83 }, // Example: 1 USD = 83 INR
  // "new_account_eur": { currency: "EUR", rate: 90 }, // Example: 1 EUR = 90 INR
};

// Helper function to convert spend to INR based on account type (API use only)
export const convertSpendAPI = (spend, account) => {
  const spendValue = parseFloat(spend || 0);
  
  // AED accounts need conversion, others are already in INR
  if (account === "mms_af" || account === "lf_af" || account === "videonation_af" || account === "photonation_af") {
    return spendValue * 23; // Convert AED to INR
  }
  
  // VideoNation and MMS are already in INR - no conversion
  return spendValue;
};

// Helper function for frontend - data is already converted, just parse
export const parseSpend = (spend) => {
  return parseFloat(spend || 0);
};

// Helper function to get currency info for an account
export const getCurrencyInfo = (account) => {
  return CURRENCY_CONFIG[account] || CURRENCY_CONFIG["default"];
};

// Helper function to format currency display (data already converted to INR)
export const formatCurrency = (amount) => {
  const amountValue = parseFloat(amount || 0);
  return `₹${Math.round(amountValue).toLocaleString('en-IN')}`;
};

// Helper function to add new currency configuration (for future use)
export const addCurrencyConfig = (account, currency, rate) => {
  CURRENCY_CONFIG[account] = { currency, rate };
};