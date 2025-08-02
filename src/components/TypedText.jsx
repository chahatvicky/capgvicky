import { useEffect, useRef } from 'react';

const TypedText = ({ strings, typeSpeed = 50, backSpeed = 30, loop = true, className = "" }) => {
  const elementRef = useRef(null);
  const typedRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    let currentStringIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const currentString = strings[currentStringIndex];
      
      if (isDeleting) {
        elementRef.current.textContent = currentString.substring(0, currentCharIndex - 1);
        currentCharIndex--;
      } else {
        elementRef.current.textContent = currentString.substring(0, currentCharIndex + 1);
        currentCharIndex++;
      }

      let typeSpeedDelay = isDeleting ? backSpeed : typeSpeed;

      if (!isDeleting && currentCharIndex === currentString.length) {
        typeSpeedDelay = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentStringIndex = (currentStringIndex + 1) % strings.length;
        typeSpeedDelay = 500; // Pause before next string
      }

      timeoutId = setTimeout(type, typeSpeedDelay);
    };

    type();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [strings, typeSpeed, backSpeed, loop]);

  return <span ref={elementRef} className={className}></span>;
};

export default TypedText;