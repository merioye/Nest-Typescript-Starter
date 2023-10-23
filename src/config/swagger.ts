import { DocumentBuilder } from '@nestjs/swagger';

export const buildSwaggerConfig = (PORT: number) => {
  const config = new DocumentBuilder()
    .setTitle('Nest + Typescript template')
    .setDescription(
      'This is Nest + Typescript template application made with Nest and documented with Swagger',
    )
    .setVersion('1.0')
    .addServer(`http://localhost:${PORT}`, 'Local Server')
    .build();

  return config;
};
