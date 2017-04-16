export const searchOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1
};

export function search(fuses, categories, pattern) {
    let res = [];
    fuses.forEach((category) => {
        const matches = category.fuse.search(pattern);
        if (matches) {
            const resolvedMatches = matches.map((index) => { return { match: categories[category.name][index], category: category.name } });
            res = res.concat(resolvedMatches);
        }
    });

    return res;
}
