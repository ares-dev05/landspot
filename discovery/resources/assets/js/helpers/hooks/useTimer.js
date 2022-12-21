import React, {useEffect, useState} from 'react';

export function useTimer(start, seconds = 10, reset = false) {
    const [count, setCount] = useState(seconds);

    useEffect(() => {
        if(reset){
            setCount(seconds);
        }
    }, [reset]);

    useEffect(() => {
        if (start && count > 0) {
            const secondsLeft = setInterval(() => {
                setCount(c => c - 1);
            }, 1000);
            return () => clearInterval(secondsLeft);
        }
    }, [start, count > 0]);

    return count;
}