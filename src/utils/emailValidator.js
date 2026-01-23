// src/utils/emailValidator.js


export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !email.trim()) {
    return { isValid: false, message: "Email is required" };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email format" };
  }

  if (email.length > 254) {
    return { isValid: false, message: "Email is too long" };
  }

  const commonDomains = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "yahooo.com": "yahoo.com",
    "outlok.com": "outlook.com",
  };

  const domain = email.split("@")[1]?.toLowerCase();
  if (commonDomains[domain]) {
    return {
      isValid: false,
      message: `Did you mean ${email.split("@")[0]}@${commonDomains[domain]}?`,
    };
  }

  return { isValid: true, message: "Valid email" };
}

export function isTemporaryEmail(email) {
  const tempDomains = [
    "tempmail.com",
    "throwaway.email",
    "10minutemail.com",
    "mailinator.com",
    "temp-mail.org",
    "guerrillamail.com",
    "maildrop.cc",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return tempDomains.includes(domain);
}

export function validateEmailComprehensive(email) {
  const basicValidation = validateEmail(email);

  if (!basicValidation.isValid) {
    return {
      isValid: false,
      message: basicValidation.message,
      isTemporary: false,
    };
  }

  const isTemp = isTemporaryEmail(email);
  if (isTemp) {
    return {
      isValid: false,
      message: "Temporary email addresses are not allowed",
      isTemporary: true,
    };
  }

  return {
    isValid: true,
    message: "Valid email",
    isTemporary: false,
  };
}