/**
 * Environments in which the application could be running
 */
enum Environment {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
}

/**
 * Configuration(Environment variables) keys
 */
enum Config {
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  API_PREFIX = 'API_PREFIX',
  API_DEFAULT_VERSION = 'API_DEFAULT_VERSION',
  DEBUG_MODE = 'DEBUG_MODE',
  GRACEFUL_SHUTDOWN_TIMEOUT = 'GRACEFUL_SHUTDOWN_TIMEOUT',
  LOCALIZATION_KEY = 'LOCALIZATION_KEY',
  LOCALIZATION_FALLBACK_LANGUAGE = 'LOCALIZATION_FALLBACK_LANGUAGE',
}

export { Environment, Config };
