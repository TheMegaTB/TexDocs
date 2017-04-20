import ServerDate from './ServerDate';

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

export function getTime() {
    return ServerDate.now();
}

export function secondsToString(seconds) {
    const numyears = Math.floor(seconds / 31536000);
    const numdays = Math.floor((seconds % 31536000) / 86400);
    const numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    const numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    const numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);

    if (numyears > 0) {
        return numyears + ' year' + (numyears > 1 ? 's' : '');
    } else if (numdays > 0) {
        return numdays + ' day' + (numdays > 1 ? 's' : '');
    } else if (numhours > 0) {
        return numhours + ' hour' + (numhours > 1 ? 's' : '');
    } else if (numminutes > 0) {
        return numminutes + ' minute' + (numminutes > 1 ? 's' : '');
    } else if (numseconds > 0) {
        return numseconds + ' second' + (numseconds > 1 ? 's' : '');
    }
}

export function dateToString(date) {
    const isToday = (date.toDateString() === new Date().toDateString());
    if (isToday) {
        return formatAMPM(date);
    } else {
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }
}
