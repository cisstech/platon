import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";

export class Mapper {
  static map<T, R>(input: T, output: ClassConstructor<R>): R {
    const object = instanceToPlain(input);
    return plainToInstance(output, object)
  }

  static mapAll<T, R>(inputs: T[], output: ClassConstructor<R>): R[] {
    return inputs.map(input => {
      const object = instanceToPlain(input);
      return plainToInstance(output, object)
    })
  }
}
