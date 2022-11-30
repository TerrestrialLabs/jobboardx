import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const MultipleObserver = ({ children }: { children: JSX.Element }) => {
    const { ref, inView } = useInView({ triggerOnce: true });

    useEffect(() => { 
        if (inView) {
            console.log("Track view") 
        }
    }, [inView])

    // Wrap item in scrollable list
    return (
             <div ref={ref}>    
               {children}
             </div>
          )
}

export default MultipleObserver;