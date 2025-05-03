
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { reportError } from '@/services/errorReportService';

interface ErrorReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | Error;
  onClose: () => void;
}

const ErrorReportForm = ({ open, onOpenChange, error, onClose }: ErrorReportFormProps) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const handleReport = async () => {
    setIsSending(true);
    try {
      const additionalInfo = {
        reportedBy: email || 'anonymous user',
        browserInfo: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      
      const success = await reportError(error, additionalInfo);
      
      if (success) {
        setIsSent(true);
        setTimeout(() => {
          setIsSent(false);
          onOpenChange(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error("Error reporting:", err);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" /> 
            Error Occurred
          </DialogTitle>
          <DialogDescription>
            We apologize for the inconvenience. Would you like to report this error to help us improve?
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-red-50 rounded-md mb-4 text-sm text-red-800">
          {typeof error === 'string' ? error : error.message || 'An unknown error occurred'}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email (Optional)</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <p className="text-xs text-muted-foreground">
              We'll only use your email to follow up on this error if needed.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={handleClose}>
            Dismiss
          </Button>
          <Button 
            onClick={handleReport} 
            className="relative"
            disabled={isSending || isSent}
          >
            {isSending ? (
              <>
                <span className="opacity-0">Report Error</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full border-2 border-current border-r-transparent animate-spin" />
                </div>
              </>
            ) : isSent ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Reported
              </>
            ) : (
              "Report Error"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorReportForm;
