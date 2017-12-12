/**
 * Created by elioth010 on 6/2/17.
 */
export interface FormSectionInterface {
  next(): void;
  validateForm(): void;
  loadPartial(): void;
  partialSave(): void;
}
