
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_ERROR_TEMPLATE_ID } from '@/utils/emailjs';
import { addStoredErrorReport } from '@/utils/localStorageBackup';

export interface ErrorReport {
  error: string;
  timestamp: string;
  userAgent: string;
  url: string;
  ipAddress?: string;
  additionalInfo?: any;
}

// Function to prepare an error report
export const prepareErrorReport = (
  error: string | Error,
  additionalInfo?: any
): ErrorReport => {
  return {
    error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    additionalInfo
  };
};

// Function to get IP address (for better error reporting)
const getIPAddress = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to get IP address:", error);
    return undefined;
  }
};

// Function to send error report via EmailJS (to be configured later)
export const sendErrorReport = async (report: ErrorReport): Promise<boolean> => {
  try {
    // Try to get IP address
    const ipAddress = await getIPAddress();
    if (ipAddress) {
      report.ipAddress = ipAddress;
    }
    
    // Log the report for debugging
    console.log("Error report prepared for sending:", report);
    
    try {
      // Send the error report via EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_ERROR_TEMPLATE_ID,
        {
          error: report.error,
          timestamp: report.timestamp,
          userAgent: report.userAgent,
          url: report.url,
          ipAddress: report.ipAddress || "Unknown",
          additionalInfo: JSON.stringify(report.additionalInfo || {})
        }
      );
      console.log("Error report sent successfully", response);
    } catch (emailError) {
      console.error("EmailJS failed to send error report:", emailError);
      
      // Store error reports locally as backup using our utility function
      addStoredErrorReport(report);
      
      console.log("Error report saved locally");
    }
    
    // Return true to indicate success (this will work with real EmailJS implementation)
    return true;
  } catch (error) {
    console.error("Failed to send error report:", error);
    return false;
  }
};

// Error reporting component to be used when errors occur
export const reportError = async (
  error: string | Error, 
  additionalInfo?: any
): Promise<boolean> => {
  const report = prepareErrorReport(error, additionalInfo);
  return await sendErrorReport(report);
};
