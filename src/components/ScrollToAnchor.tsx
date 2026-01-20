import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToAnchor = () => {
  const location = useLocation();
  const lastHash = useRef('');
  const lastPathname = useRef(location.pathname);

  useEffect(() => {
    // Check if pathname changed (navigating to new page)
    const isNewPage = location.pathname !== lastPathname.current;
    lastPathname.current = location.pathname;

    if (location.hash) {
      // Has a hash - scroll to that element
      lastHash.current = location.hash.slice(1);
      
      setTimeout(() => {
        const element = document.getElementById(lastHash.current);
        if (element) {
          element.scrollIntoView({
            behavior: isNewPage ? 'instant' : 'smooth',
            block: 'start'
          });
        }
        lastHash.current = '';
      }, 100);
    } else if (isNewPage) {
      // New page without hash - scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location]);

  return null;
};

export default ScrollToAnchor;
