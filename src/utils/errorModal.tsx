import EventEmitter from './eventEmitter';

const emitter = new EventEmitter();

export function showError (payload: { title?: string; message?: string; }) {
    emitter.emit('show', payload);
}

export function hideError () {
    emitter.emit('hide');
}

export function subscribe (onShow: (p: any) => void, onHide: () => void) {
    emitter.on('show', onShow);
    emitter.on('hide', onHide);
    return () => {
        emitter.off('show', onShow);
        emitter.off('hide', onHide);
    };
}

export default { showError, hideError, subscribe };
