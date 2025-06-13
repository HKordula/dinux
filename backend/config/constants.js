const constants = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },
  USER_STATUS: {
    ACTIVATED: 'activated',
    BLOCKED: 'blocked'
  },
  LOGIN: {
    MAX_FAILED_ATTEMPTS: 10
  },
  JWT: {
    EXPIRES_IN: '3h',
  },
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Authentication required',
    NOT_FOUND: 'Resource not found'
  },
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
export default constants;