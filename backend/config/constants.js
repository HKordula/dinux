module.exports = {
    ROLES: {
      USER: 'user',
      ADMIN: 'admin'
    },
    PAGINATION: {
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100
    },
    JWT: {
      EXPIRES_IN: '1h',
      COOKIE_EXPIRES: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    ERROR_MESSAGES: {
      UNAUTHORIZED: 'Authentication required',
      FORBIDDEN: 'Access forbidden',
      NOT_FOUND: 'Resource not found'
    }
  };