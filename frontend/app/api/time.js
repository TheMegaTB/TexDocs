import ServerDate from './ServerDate';

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
