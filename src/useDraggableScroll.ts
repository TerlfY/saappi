import { useEffect, RefObject } from 'react';

const useDraggableScroll = (ref: RefObject<HTMLElement>) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            element.classList.add('active');
            startX = e.pageX - element.offsetLeft;
            scrollLeft = element.scrollLeft;
            element.style.cursor = 'grabbing';
        };

        const onMouseLeave = () => {
            isDown = false;
            element.classList.remove('active');
            element.style.cursor = 'grab';
        };

        const onMouseUp = () => {
            isDown = false;
            element.classList.remove('active');
            element.style.cursor = 'grab';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - element.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast
            element.scrollLeft = scrollLeft - walk;
        };

        // Set initial cursor
        element.style.cursor = 'grab';

        // Cast to any because TS might complain about specific event types on generic HTMLElement
        // but standard addEventListener works fine.
        element.addEventListener('mousedown', onMouseDown as any);
        element.addEventListener('mouseleave', onMouseLeave as any);
        element.addEventListener('mouseup', onMouseUp as any);
        element.addEventListener('mousemove', onMouseMove as any);

        return () => {
            element.removeEventListener('mousedown', onMouseDown as any);
            element.removeEventListener('mouseleave', onMouseLeave as any);
            element.removeEventListener('mouseup', onMouseUp as any);
            element.removeEventListener('mousemove', onMouseMove as any);
            // Clean up cursor style
            if (element) element.style.cursor = '';
        };
    }, [ref]);
};

export default useDraggableScroll;
