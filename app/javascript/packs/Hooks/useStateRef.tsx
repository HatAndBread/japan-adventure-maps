import { useState, useRef, useEffect, MutableRefObject } from 'react';

export const useStateRef = (initialValue: any): [any, MutableRefObject<any>, React.Dispatch<any>] => {
  const [value, setValue] = useState(initialValue);

  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, ref, setValue];
};
