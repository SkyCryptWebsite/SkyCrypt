const MONTHS = [
    "Early Spring", "Spring", "Late Spring",
    "Early Summer", "Summer", "Late Summer",
    "Early Autumn", "Autumn", "Late Autumn",
    "Early Winter", "Winter", "Late Winter"
];

const HOUR_MS = 50_000;
const DAY_MS = 24 * HOUR_MS;
const MONTH_LENGTH = 31;
const YEAR_LENGTH = MONTHS.length;

const MONTH_MS = MONTH_LENGTH * DAY_MS;
const YEAR_MS = YEAR_LENGTH * MONTH_MS;

const YEAR_0 = 1560275700_000;

const DURATION_FORMAT = function(){
    return this.duration.asSeconds() >= 60 ? "d [days, ]h [hours, ]m [minutes]" : "s [seconds]";
};

const ZOO_START = YEAR_0 + YEAR_MS * 66;
const ZOO_CYCLE_MS = YEAR_MS / 2;
const ZOO_CYCLE = [
    "ELEPHANT",
    "GIRAFFE",
    "BLUE_WHALE",
    "TIGER",
    "LION",
    "MONKEY"
];

const getOffset = (month, day) => {
    return MONTHS.indexOf(month) * MONTH_LENGTH * DAY_MS 
    + (day - 1) * DAY_MS;
}

const getZooPet = time => {
    const iterations = Math.floor((time - ZOO_START) / ZOO_CYCLE_MS);

    return ZOO_CYCLE[iterations % ZOO_CYCLE.length];
}

const nth = n => n + ['st','nd','rd'][((n + 90) % 100 - 10) % 10 - 1] || n + 'th';

const EVENTS = [
    {
        name: 'Traveling Zoo',
        times: [
            [getOffset('Early Summer', 1), getOffset('Early Summer', 3)],
            [getOffset('Early Winter', 1), getOffset('Early Winter', 3)]
        ]
    },
    {
        name: 'Fear Mongerer',
        times: [
            [getOffset('Autumn', 26), getOffset('Late Autumn', 3)]
        ]
    },
    {
        name: 'Spooky Festival',
        times: [
            [getOffset('Autumn', 29), getOffset('Autumn', 31)]
        ]
    },
    {
        times: [
            [getOffset('Late Winter', 24), getOffset('Late Winter', 26)]
        ]
    },
    {
        name: 'Jerry Workshop',
        times: [
            [getOffset('Late Winter', 1), getOffset('Late Winter', 31)]
        ]
    },
    {
        name: 'New Year Celebration',
        times: [
            [getOffset('Late Winter', 29), getOffset('Late Winter', 31)]
        ]
    },
    {
        name: 'Election Booth Opens',
        times: [
            [getOffset('Late Summer', 27), getOffset('Late Summer', 27)]
        ]
    },
    {
        name: 'Election Over',
        times: [
            [getOffset('Late Spring', 27), getOffset('Late Spring', 27)]
        ]
    },
    {
        name: 'National Mining Month',
        years: [91],
        times: [
            [getOffset('Late Summer', 22), getOffset('Early Autumn', 21)]
        ]
    }
];

function getTime(time){
    const currentYear = Math.floor((time - YEAR_0) / YEAR_MS);
    const currentOffset = (time - YEAR_0) % YEAR_MS;

    const currentMonth = Math.floor(currentOffset / MONTH_MS);
    const currentMonthOffset = (currentOffset - currentMonth * MONTH_MS) % MONTH_MS;

    const currentDay = Math.floor(currentMonthOffset / DAY_MS);
    const currentDayOffset = (currentMonthOffset - currentDay * DAY_MS) % DAY_MS;

    let suffix = 'am';
    let currentHour = Math.floor(currentDayOffset / HOUR_MS);
    let currentMinute = Math.floor((currentDayOffset - currentHour * HOUR_MS) / HOUR_MS * 60);

    let emoji = '☀️'
    if(currentHour >= 19 || currentHour < 6){
        emoji = '🌙'
    }

    if(currentHour >= 12)
        suffix = 'pm';

    if(currentHour > 12)
        currentHour -= 12;

    if(currentHour == 0)
        currentHour = 12;
    
    
    
    const formattedTime = `${currentHour}:${(Math.floor(currentMinute / 10) * 10).toString().padStart(2, '0')}${suffix}${emoji}`;


    return {
        date: `${MONTHS[currentMonth]} ${nth(currentDay + 1)}`,
        time: formattedTime
    }
}

document.addEventListener('DOMContentLoaded', function(){
    const time = document.getElementById("time");
    const updateTimes = () => {
        const currentTime = getTime(Date.now());
        time.innerHTML = `${currentTime.date} ${currentTime.time}`;
    }
    setInterval(updateTimes, 2000);
    updateTimes();
});
