
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
    
    // Log the report for now
    console.log("Error report prepared for sending:", report);
    
    // This will be implemented with EmailJS later when credentials are provided
    // const response = await emailjs.send(
    //   "serviceId",
    //   "templateId",
    //   {
    //     error: report.error,
    //     timestamp: report.timestamp,
    //     userAgent: report.userAgent,
    //     url: report.url,
    //     ipAddress: report.ipAddress || "Unknown",
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
