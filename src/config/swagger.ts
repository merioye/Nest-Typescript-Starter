import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

/**
 * Creates swagger configuration
 *
 * @param {number} PORT - Port which swagger will be served on
 * @returns {Omit<OpenAPIObject, 'paths'>} - Swagger configuration
 */
export const buildSwaggerConfig = (
  PORT: number
): Omit<OpenAPIObject, 'paths'> => {
  const config = new DocumentBuilder()
    .setTitle('Nest + Typescript starter')
    .setDescription(
      'This is Nest + Typescript starter application made with Nest and documented with Swagger'
    )
    .setVersion('1.0')
    .addServer(`http://localhost:${PORT}`, 'Local Server')
    .build();

  return config;
};
