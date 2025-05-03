
interface ErrorReport {
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

// Function to send error report via EmailJS (to be configured later)
export const sendErrorReport = async (report: ErrorReport): Promise<boolean> => {
  try {
    // Log the report for now
    console.log("Error report prepared for sending:", report);
    
    // This will be implemented with EmailJS later
    // const response = await emailjs.send(
    //   "serviceId",
    //   "templateId",
    //   {
    //     error: report.error,
    //     timestamp: report.timestamp,
    //     userAgent: report.userAgent,
    //     url: report.url,
    //     additionalInfo: JSON.stringify(report.additionalInfo || {})
    //   },
    //   "userID"
    // );
    
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
