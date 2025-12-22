export default class EventEmitter {
    private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

    on (event: string, handler: (...args: any[]) => void) {
        const set = this.listeners.get(event) ?? new Set();
        set.add(handler);
        this.listeners.set(event, set);
    }

    off (event: string, handler?: (...args: any[]) => void) {
        if (!handler) {
            this.listeners.delete(event);
            return;
        }
        const set = this.listeners.get(event);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) this.listeners.delete(event);
    }

    once (event: string, handler: (...args: any[]) => void) {
        const wrapper = (...args: any[]) => {
            handler(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    emit (event: string, ...args: any[]) {
        const set = this.listeners.get(event);
        if (!set) return;
        // copy to prevent mutation during iteration
        const handlers = Array.from(set);
        for (const h of handlers) {
            try { h(...args); } catch (e) { /* swallow listener errors */ }
        }
    }
}
