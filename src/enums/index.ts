/**
 * Environments in which the application could be running
 */
enum ENVIRONMENT {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
}

/**
 * Configuration(Environment variables) keys
 */
enum CONFIG {
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  API_PREFIX = 'API_PREFIX',
  API_DEFAULT_VERSION = 'API_DEFAULT_VERSION',
}

export { ENVIRONMENT, CONFIG };
