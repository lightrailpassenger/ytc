import { useCallback, useState } from 'react';

const useLocalStorage = (rawKey) => {
    const key = `ytc-${rawKey}`;
    const [state, setState] = useState(() => {
        return window.localStorage.getItem(key);
    });
    const update = useCallback((value) => {
        const newValue = typeof value === 'function' ?
            value(window.localStorage.getItem(key)) :
            value;

        setState(newValue);
        window.localStorage.setItem(key, newValue);
    }, []);

    return [state, update];
};

export default useLocalStorage;
