import { useEffect, useRef } from 'react';

const useDraggableScroll = (ref) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const onMouseDown = (e) => {
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

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - element.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast
            element.scrollLeft = scrollLeft - walk;
        };

        // Set initial cursor
        element.style.cursor = 'grab';

        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mouseleave', onMouseLeave);
        element.addEventListener('mouseup', onMouseUp);
        element.addEventListener('mousemove', onMouseMove);

        return () => {
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('mouseleave', onMouseLeave);
            element.removeEventListener('mouseup', onMouseUp);
            element.removeEventListener('mousemove', onMouseMove);
            // Clean up cursor style
            if (element) element.style.cursor = '';
        };
    }, [ref]);
};

export default useDraggableScroll;
