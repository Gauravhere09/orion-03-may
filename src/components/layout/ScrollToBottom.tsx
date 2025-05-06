
import { useState, useEffect, RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ScrollToBottomProps {
  containerRef: RefObject<HTMLElement>;
  className?: string;
}

const ScrollToBottom = ({ containerRef, className = '' }: ScrollToBottomProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button when not at the bottom (with some buffer)
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    };

    // Add scroll event listener
    container.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!showScrollButton) return null;

  return (
    <Button
      onClick={scrollToBottom}
      size="sm"
      className={`fixed bottom-20 right-4 z-50 rounded-full w-10 h-10 p-0 shadow-lg flex items-center justify-center ${className}`}
      variant="secondary"
    >
      <ChevronDown className="h-5 w-5" />
    </Button>
  );
};

export default ScrollToBottom;
