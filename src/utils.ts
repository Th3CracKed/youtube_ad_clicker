export async function findAsync<T>(array: T[], predicate: (value: T, index?: number, obj?: T[]) => Promise<boolean>): Promise<T> {
    const candidates = await Promise.all(array.map(predicate));
    const index = candidates.findIndex(candidate => candidate);
    return array[index];
}

export function generateRandomPassword(numberOfCharacters = 12) {
    return Math.random().toString(36).slice(-numberOfCharacters);
}


export function chainAllTasksInSeries<T>(tasksFactory: (() => Promise<T>)[]): Promise<T[]> {
    return tasksFactory.reduce((promiseChain, currentTask) => {
        return promiseChain.then(chainResults =>
            currentTask().then(currentResult =>
                [...chainResults, currentResult]
            )
        );
    }, Promise.resolve([]));
}