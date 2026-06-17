import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export async function validateDto<T extends object>(
  DtoClass: new () => T,
  plain: unknown
): Promise<{ errors: string[] | null; dto: T }> {
  const dto = plainToInstance(DtoClass, plain);
  const errors = await validate(dto);

  if (errors.length > 0) {
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
    return { errors: messages, dto };
  }

  return { errors: null, dto };
}