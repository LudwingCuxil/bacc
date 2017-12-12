export class ReferenceDTO {
  constructor(public guardada?: boolean,
              public modalidad?: Mode) {
  }
}

export enum Mode {
  I, // Insert
  U, // Update
  D, // Delete
}
