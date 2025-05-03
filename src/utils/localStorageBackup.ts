/**
 * Utility functions for managing locally stored contact messages and error reports
 * when EmailJS is unavailable or encounters errors
 */

// Types
interface StoredContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

interface StoredErrorReport {
  error: string;
  timestamp: string;
  userAgent: string;
  url: string;
  ipAddress?: string;
  additionalInfo?: any;
}

// Constants
const CONTACT_MESSAGES_KEY = 'contactFormMessages';
const ERROR_REPORTS_KEY = 'errorReports';

// Contact message functions
export const getStoredContactMessages = (): StoredContactMessage[] => {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
  } catch (error) {
    console.error('Failed to parse stored contact messages:', error);
    return [];
  }
};

export const addStoredContactMessage = (message: Omit<StoredContactMessage, 'timestamp'>) => {
  try {
    const messages = getStoredContactMessages();
    messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error('Failed to store contact message:', error);
    return false;
  }
};

export const clearStoredContactMessages = () => {
  localStorage.removeItem(CONTACT_MESSAGES_KEY);
};

// Error report functions
export const getStoredErrorReports = (): StoredErrorReport[] => {
  try {
    return JSON.parse(localStorage.getItem(ERROR_REPORTS_KEY) || '[]');
  } catch (error) {
    console.error('Failed to parse stored error reports:', error);
    return [];
  }
};

export const addStoredErrorReport = (report: StoredErrorReport) => {
  try {
    const reports = getStoredErrorReports();
    reports.push(report);
    localStorage.setItem(ERROR_REPORTS_KEY, JSON.stringify(reports));
    return true;
  } catch (error) {
    console.error('Failed to store error report:', error);
    return false;
  }
};

export const clearStoredErrorReports = () => {
  localStorage.removeItem(ERROR_REPORTS_KEY);
};

// Utility to check if there are pending items
export const hasPendingItems = (): { contactMessages: number, errorReports: number } => {
  return {
    contactMessages: getStoredContactMessages().length,
    errorReports: getStoredErrorReports().length
  };
};
