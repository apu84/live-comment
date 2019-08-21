import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { getRepository } from "typeorm";

export interface IfMatchValidationOptions extends ValidationOptions {
  context: {
    entity: Function;
    entityIdPropertyName?: string;
  };
}

@ValidatorConstraint({ async: true })
export class IfMatchConstraint<T extends string>
  implements ValidatorConstraintInterface {
  constructor(
    private entityTypeName: string,
    private idPropertyName: string = "id"
  ) {}

  async validate(version: number, args: ValidationArguments) {
    const id = (args.object as any)[this.idPropertyName];
    if (!id) {
      throw new Error("Entity id property is missing");
    }
    const entity = await getRepository<T>(this.entityTypeName).findOne({
      where: { id, version }
    });
    if (entity) {
      return true;
    }
    return false;
  }

  defaultMessage(): string {
    return "Version mismatch";
  }
}

export function IfMatch(validationOptions: IfMatchValidationOptions) {
  const entityTypeName = validationOptions.context.entity.name;
  if (!entityTypeName) {
    throw new Error("Entity name is required");
  }
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: new IfMatchConstraint(
        entityTypeName,
        validationOptions.context.entityIdPropertyName
      )
    });
  };
}
