import { useState, useEffect, useRef } from 'react';

const useScrollDirection = (): "up" | "down" => {
    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
    const lastScrollY = useRef<number>(0);
    const ticking = useRef<boolean>(false);

    useEffect(() => {
        const updateScrollDirection = () => {
            const scrollY = window.pageYOffset;

            // Force "up" when at the top of the page to ensure navbar is visible
            if (scrollY < 10) {
                setScrollDirection("up");
                lastScrollY.current = scrollY > 0 ? scrollY : 0;
                ticking.current = false;
                return;
            }

            const direction = scrollY > lastScrollY.current ? "down" : "up";
            const diff = Math.abs(scrollY - lastScrollY.current);

            // Only update if difference is significant to avoid jitter
            if (diff > 5) {
                setScrollDirection(direction);
                lastScrollY.current = scrollY > 0 ? scrollY : 0;
            }

            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(updateScrollDirection);
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []); // Empty dependency array ensures listener is attached once

    return scrollDirection;
};

export default useScrollDirection;
