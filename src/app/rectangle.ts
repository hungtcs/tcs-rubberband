import { Point } from "./point"

export class Rectangle extends Point {
  public width: number;
  public height: number;

  constructor(that: Partial<Rectangle> = {}) {
    super();
    Object.assign(this, that);
  }
}
