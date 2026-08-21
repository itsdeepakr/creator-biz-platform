import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.metatype || !this.isValidationActive(metadata)) {
      return value;
    }

    if (value === null || value === undefined) {
      return value;
    }

    const obj = plainToInstance(metadata.metatype, value);
    if (typeof obj !== 'object' || obj === null) {
      return value;
    }

    const errors = await validate(obj as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((err) => Object.values(err.constraints || {}))
        .flat();
      throw new BadRequestException(messages.join(', '));
    }

    return obj;
  }

  private isValidationActive(metadata: ArgumentMetadata): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metadata.metatype!);
  }
}
