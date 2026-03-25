function getLastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function toPeriod(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function getScheduledDayForMonth(year, month, diaCobro) {
    return Math.min(diaCobro, getLastDayOfMonth(year, month));
}

function getScheduledDateForPeriod(period, diaCobro) {
    const [yearStr, monthStr] = period.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = getScheduledDayForMonth(year, month, Number(diaCobro));
    return new Date(Date.UTC(year, month - 1, day));
}

function isDateOnOrAfter(dateA, dateB) {
    return dateA.getTime() >= dateB.getTime();
}

module.exports = {
    getLastDayOfMonth,
    toPeriod,
    getScheduledDayForMonth,
    getScheduledDateForPeriod,
    isDateOnOrAfter,
};
