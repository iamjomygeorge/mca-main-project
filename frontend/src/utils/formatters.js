export const formatTimestamp = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

export const formatCurrency = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (e) {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  }
};
