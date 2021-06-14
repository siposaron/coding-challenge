import { TransformFnParams } from 'class-transformer';

export const valueToString = (obj: TransformFnParams) => obj?.value?.toString();

export const valueToISODateString = (obj: TransformFnParams) => {
  return obj?.value ? new Date(obj?.value).toISOString() : null;
};
