// Date utility functions

export const setDateRange = (days, rangeKey, setDailyStartDate, setDailyEndDate, setActiveRange) => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);
  
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (days - 1));
  
  setDailyStartDate(startDate.toISOString().split('T')[0]);
  setDailyEndDate(endDate.toISOString().split('T')[0]);
  setActiveRange(rangeKey);
};

export const getDefaultDateRange = () => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);
  
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};