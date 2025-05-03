
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import { reportError } from '@/services/errorReportService';

interface ErrorReportButtonProps {
  error: string | Error;
  additionalInfo?: any;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const ErrorReportButton = ({ 
  error, 
  additionalInfo,
  variant = "outline",
  size = "sm" 
}: ErrorReportButtonProps) => {
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);
  
  const handleReport = async () => {
    setIsReporting(true);
    try {
      const success = await reportError(error, additionalInfo);
      if (success) {
        setIsReported(true);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setIsReported(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error in reporting:", err);
    } finally {
      setIsReporting(false);
    }
  };
  
  if (isReported) {
    return (
      <Button 
        variant="ghost" 
        size={size} 
        className="text-green-600"
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        Reported
      </Button>
    );
  }
  
  return (
    <Button 
      variant={variant} 
      size={size}
      className="flex items-center space-x-2"
      onClick={handleReport}
      disabled={isReporting}
    >
      {isReporting ? (
        <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2" />
      ) : (
        <AlertCircle className="h-4 w-4 mr-2" />
      )}
      <span>Report Error</span>
    </Button>
  );
};

export default ErrorReportButton;
