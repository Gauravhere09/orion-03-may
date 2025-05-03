import emailjs from '@emailjs/browser';

// Initialize EmailJS
export const initEmailJS = () => {
  // Initialize with your public key - this needs to be your actual public key from EmailJS
  emailjs.init("K-u5FIcnqWpemwNH9");
};

// Export common EmailJS constants
export const EMAILJS_SERVICE_ID = "service_s9uvigk";
export const EMAILJS_ERROR_TEMPLATE_ID = "template_y48vazu";
export const EMAILJS_CONTACT_TEMPLATE_ID = "template_y48vazu";
