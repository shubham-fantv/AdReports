import { format, subDays, startOfMonth } from 'date-fns';

export const presets = [
  "today",
  "yesterday",
  "this_month",
  "last_month",
  "this_quarter",
  "maximum",
  "data_maximum",
  "last_3d",
  "last_7d",
  "last_14d",
  "last_28d",
  "last_30d",
  "last_90d",
  "last_week_mon_sun",
  "last_week_sun_sat",
  "last_quarter",
  "last_year",
  "this_week_mon_today",
  "this_week_sun_today",
  "this_year",
];

// Helper functions using date-fns for IST timezone
export const getISTDate = () => {
  const now = new Date();
  // Convert to IST (UTC+5:30) manually
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (5.5 * 3600000));
  return istTime;
};

export const formatDateString = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const getTodayIST = () => {
  return formatDateString(getISTDate());
};

export const getYesterdayIST = () => {
  const today = getISTDate();
  const yesterday = subDays(today, 1);
  return formatDateString(yesterday);
};

export const getActionValue = (actions, actionType) => {
  if (!actions || !Array.isArray(actions)) return 0;
  const action = actions.find(a => a.action_type === actionType);
  return action ? parseInt(action.value || 0) : 0;
};