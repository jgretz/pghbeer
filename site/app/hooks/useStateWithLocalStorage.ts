import {useEffect, useState} from 'react';

export function useStateWthLocalStorage<T>(key: string, defaultValue: T) {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const json = localStorage.getItem(key);
    const initialValue = json ? (JSON.parse(json) as T) : defaultValue;

    setState(initialValue);
  }, [defaultValue, key]);

  const setWithLocalStorage = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setWithLocalStorage] as [T, (t: T) => void];
}
