export default class Tooltip {
  constructor() {
    this.tooltips = [];
  }

  getAll() {
    return [...document.querySelectorAll(".form-error")];
  }

  showTooltip(message, element) {
    const tooltipElement = document.createElement("div");
    tooltipElement.classList.add("form-error");
    tooltipElement.textContent = message;

    const id = performance.now();

    this.tooltips.push({
      id,
      element: tooltipElement,
    });

    document.body.appendChild(tooltipElement);

    const { right, top } = element.getBoundingClientRect();

    tooltipElement.style.left = right + 5 + "px";

    tooltipElement.style.top =
      top + element.offsetHeight / 2 - tooltipElement.offsetHeight / 2 + "px";

    return id;
  }

  removeTooltip(id) {
    const tooltip = this.tooltips.find((el) => el.id === id);

    if (tooltip) {
      tooltip.element.remove();
    }

    this.tooltips = this.tooltips.filter((el) => el.id !== id);
  }
}
