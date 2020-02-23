import { Rubberband } from './app/rubberband';

document.addEventListener('DOMContentLoaded', _ => {
  const countElement = document.querySelector('.selected-count');
  new Rubberband({
    element: document.querySelector('.rubberband-container'),
  })
  .onSelectedCellsChange((selectedCells) => {
    countElement.innerHTML = `${ selectedCells.size }`;
    console.log(selectedCells);
  });
});

