import { buildSwaggerConfig } from '../swagger';

describe('Swagger Configuration', () => {
  describe('buildSwaggerConfig', () => {
    const TEST_PORT = 3000;

    it('should create a valid swagger configuration', () => {
      const config = buildSwaggerConfig(TEST_PORT);

      // Test if the returned object is of correct type
      expect(config).toBeDefined();
      expect(config).toHaveProperty('openapi');
      expect(config).toHaveProperty('info');
      expect(config).toHaveProperty('servers');
    });

    it('should have correct metadata', () => {
      const config = buildSwaggerConfig(TEST_PORT);

      // Test info object
      expect(config.info).toEqual({
        contact: {},
        title: 'Nest + Typescript starter',
        description:
          'This is Nest + Typescript starter application made with Nest and documented with Swagger',
        version: '1.0',
      });
    });

    it('should configure server with correct port', () => {
      const config = buildSwaggerConfig(TEST_PORT);

      // Test servers configuration
      expect(config.servers).toHaveLength(1);
      expect(config.servers?.[0]).toEqual({
        url: `http://localhost:${TEST_PORT}`,
        description: 'Local Server',
      });
    });

    it('should use different ports as provided', () => {
      const DIFFERENT_PORT = 5000;
      const config = buildSwaggerConfig(DIFFERENT_PORT);

      expect(config.servers?.[0]?.url).toBe(
        `http://localhost:${DIFFERENT_PORT}`
      );
    });
  });
});
