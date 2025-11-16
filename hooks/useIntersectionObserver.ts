import { useState, useEffect, RefObject } from 'react';

export const useIntersectionObserver = (
    elementRef: RefObject<Element>,
    { threshold = 0.1, root = null, rootMargin = '0%' }
): boolean => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Stop observing after it's visible to prevent re-triggering
                    observer.unobserve(entry.target);
                }
            },
            { threshold, root, rootMargin }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [elementRef, threshold, root, rootMargin]);

    return isVisible;
};
