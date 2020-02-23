
export class Point {
  public x: number;
  public y: number;

  constructor(that: Partial<Point> = {}) {
    Object.assign(this, that);
  }

}
