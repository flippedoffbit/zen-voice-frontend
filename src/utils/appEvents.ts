import EventEmitter from './eventEmitter';

const appEvents = new EventEmitter();

// utility: subscribe with typed handlers — returns an unsubscribe function
export function subscribe (event: string, onEvent: (...args: any[]) => void) {
    appEvents.on(event, onEvent);
    return () => appEvents.off(event, onEvent);
}

export default appEvents;
