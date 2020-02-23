import { Point } from "./point";
import { Rectangle } from "./rectangle";
import { RubberbandOptions } from "./rubberband-options";

export class Rubberband {

  /**
   * Rubberband配置对象
   */
  private options: RubberbandOptions;

  /**
   * 开始拖动的坐标
   */
  private mouseDownPoint: Point;

  /**
   * 框选器元素
   */
  private rubberbandElement: HTMLDivElement;

  /**
   * 选中的项目
   */
  private selectedCells: Set<HTMLElement> = new Set();
  private selectedCellsChange: (selectedCells: Set<HTMLElement>) => void;

  get container() {
    return this.options.element;
  }

  constructor(options: RubberbandOptions) {
    this.options = options;
    this.container.classList.add('tcs-rubberband-container');
    this.initRubberband();
  }

  public onSelectedCellsChange(callback: (selectedCells: Set<HTMLElement>) => void) {
    this.selectedCellsChange = callback;
    return this;
  }

  private initRubberband() {
    this.container.addEventListener('mousedown', event => this.onMouseDown(event));
    document.addEventListener('mousemove', event => this.onDocumentMouseMove(event));
    document.addEventListener('mouseup', event => this.onDocumentMouseUp(event));
  }

  private onMouseDown(event: MouseEvent) {
    // 如果点击到RubberbandCell则不启用选择
    if(this.isEventOnRubberbandCellElement(event)) {
      return;
    }

    const containerDOMRect = this.container.getBoundingClientRect();
    this.mouseDownPoint = new Point({
      x: event.x - containerDOMRect.left,
      y: event.y - containerDOMRect.top,
    });

    // 清除上次选中的文件
    this.clearSelectedCells();

    // 删除浏览器文字选择，避免文字拖动问题
    window.getSelection().removeAllRanges();

    if(this.rubberbandElement) {
      this.rubberbandElement.remove();
    }
    this.rubberbandElement = document.createElement('div');
    this.rubberbandElement.classList.add('tcs-rubberband');
    this.container.appendChild(this.rubberbandElement);
  }

  private onDocumentMouseMove(event: MouseEvent) {
    if(!this.mouseDownPoint) {
      return;
    }
    const bounds = new Rectangle();
    const containerDOMRect = this.container.getBoundingClientRect();
    const mousePoint = new Point({
      x: event.x - containerDOMRect.left,
      y: event.y - containerDOMRect.top,
    });

    if(mousePoint.x < 0) {
      mousePoint.x = 0;
    } else if(mousePoint.x > this.container.scrollWidth) {
      mousePoint.x = this.container.scrollWidth;
    }
    if(mousePoint.y < 0) {
      mousePoint.y = 0;
    } else if(mousePoint.y > this.container.scrollHeight) {
      mousePoint.y = this.container.scrollHeight;
    }

    if(mousePoint.x < this.mouseDownPoint.x) {
      bounds.x = mousePoint.x;
      bounds.width = this.mouseDownPoint.x - mousePoint.x;
    } else {
      bounds.x = this.mouseDownPoint.x;
      bounds.width = mousePoint.x - this.mouseDownPoint.x;
    }
    if(mousePoint.y < this.mouseDownPoint.y) {
      bounds.y = mousePoint.y;
      bounds.height = this.mouseDownPoint.y - mousePoint.y;
    } else {
      bounds.y = this.mouseDownPoint.y;
      bounds.height = mousePoint.y - this.mouseDownPoint.y;
    }

    this.rubberbandElement.style.top = `${ bounds.y }px`;
    this.rubberbandElement.style.left = `${ bounds.x }px`;
    this.rubberbandElement.style.width = `${ bounds.width }px`;
    this.rubberbandElement.style.height = `${ bounds.height }px`;

    let changed = false;
    const selectedCells = new Set(Array.from(this.container.querySelectorAll('.tcs-rubberband-cell'))
        .filter((rubberbandCell: HTMLElement) => this.isSelectRubberbandCell(rubberbandCell, bounds)) as Array<HTMLElement>);

    this.selectedCells.forEach(cell => {
      if(!selectedCells.has(cell)) {
        changed = true;
        cell.classList.remove('tcs-rubberband-cell--selected');
      }
    });

    if(changed || selectedCells.size !== this.selectedCells.size) {
      this.selectedCells = selectedCells;
      this.selectedCells.forEach(cell => {
        if(!cell.classList.contains('tcs-rubberband-cell--selected')) {
          cell.classList.add('tcs-rubberband-cell--selected');
        }
      });
      if(this.selectedCellsChange) {
        this.selectedCellsChange(this.selectedCells);
      }
    }
  }

  private onDocumentMouseUp(event: MouseEvent) {
    if(this.mouseDownPoint) {
      this.mouseDownPoint = null;
      this.container.classList.remove('tcs-rubberband--active');
      if(this.rubberbandElement) {
        this.rubberbandElement.remove();
        this.rubberbandElement = null;
      }
    }
  }

  private clearSelectedCells() {
    this.selectedCells.forEach(cell => {
      cell.classList.remove('tcs-rubberband-cell--selected');
    });
    if(this.selectedCellsChange && this.selectedCells.size > 0) {
      this.selectedCells.clear();
      this.selectedCellsChange(this.selectedCells);
    }
  }

  private isSelectRubberbandCell(rubberbandCellElement: HTMLElement, bounds: Rectangle) {
    const clientRect = rubberbandCellElement.getBoundingClientRect();
    const hostClientRect = this.container.getBoundingClientRect();
    const rubberbandCellBounds = new Rectangle({
      x: clientRect.x - hostClientRect.x,
      y: clientRect.y - hostClientRect.y,
      width: clientRect.width,
      height: clientRect.height,
    });
    const rubberbandCenterPoint = new Point({
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    });
    const rubberbandCellCenterPoint = new Point({
      x: rubberbandCellBounds.x + rubberbandCellBounds.width / 2,
      y: rubberbandCellBounds.y + rubberbandCellBounds.height / 2,
    });
    const xIntersect = Math.abs(rubberbandCenterPoint.x - rubberbandCellCenterPoint.x) < (bounds.width / 2 + rubberbandCellBounds.width / 2);
    const yIntersect = Math.abs(rubberbandCenterPoint.y - rubberbandCellCenterPoint.y) < (bounds.height / 2 + rubberbandCellBounds.height / 2);
    if(xIntersect && yIntersect) {
      return true;
    } else {
      return false;
    }
  }

  private isEventOnRubberbandCellElement(event: MouseEvent) {
    return Array.from(this.container.querySelectorAll('.tcs-rubberband-cell')).some(element => {
      return event.target === element || this.isChildNodeOfParentNode(event.target as Node, element);
    });
  }

  private isChildNodeOfParentNode(element: Node, parent: Node) {
    while(element.parentNode) {
      const parentNode = element.parentNode;
      if(parentNode === parent) {
        return true;
      } else {
        element = parentNode;
      }
    }
    return false;
  }

}
