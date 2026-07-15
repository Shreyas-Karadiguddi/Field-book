import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateDto(DtoClass, payload) {
  const instance = plainToInstance(DtoClass, payload || {});
  const errors = await validate(instance, { whitelist: true });
  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints || {}),
    );
    throw new BadRequestException(messages);
  }
  return instance;
}
