module.exports = function addBillingDate(docArr) {
  return docArr.map((sub) => {
    const billDaysMap = new Map([
      ["daily", 1],
      ["weekly", 7],
      ["monthly", 1],
      ["yearly", 12],
    ]);

    const startDate = sub.startDate;
    const today = new Date();

    if (sub.billingCycle === "daily" || sub.billingCycle === "weekly") {
      const now = Date.now();
      const elapsed = now - startDate.getTime();
      const cycle = billDaysMap.get(sub.billingCycle) * 24 * 60 * 60 * 1000;

      sub.nextBillingDate = new Date(now - (elapsed % cycle) + cycle);
      return sub;
    }

    if (sub.billingCycle === "monthly" || sub.billingCycle === "yearly") {
      // Ensure the start date is in the past or today
      if (startDate > today) {
        sub.nextBillingDate = startDate; // If the start date is in the future, it's the next billing date
        return sub;
      }

      // Calculate the next billing date
      let nextBillingDate = new Date(startDate);
      while (nextBillingDate <= today) {
        nextBillingDate.setMonth(
          nextBillingDate.getMonth() + billDaysMap.get(sub.billingCycle)
        );
      }
      sub.nextBillingDate = nextBillingDate;
      return sub;
    }
  });
};
