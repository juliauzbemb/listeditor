import Form from "./form";
import { storage } from "./storage";

export default class Actions {
  constructor() {
    this.parent = document.querySelector(".goods");

    this.changeIcons = [...document.querySelectorAll(".edit")];

    this.deleteIcons = [...document.querySelectorAll(".delete")];

    this.changeIconsOnClick = this.changeIconsOnClick.bind(this);

    this.deleteIconsOnClick = this.deleteIconsOnClick.bind(this);

    this.changeIcons.forEach((item) =>
      item.addEventListener("click", this.changeIconsOnClick)
    );

    this.deleteIcons.forEach((item) =>
      item.addEventListener("click", this.deleteIconsOnClick)
    );
  }

  changeIconsOnClick(e) {
    e.stopImmediatePropagation();
    const { name, price } = this.getData(e);
    let form = new Form();
    form.element.name.value = name;
    form.element.price.value = price;
    form.makeVisible();
    form.notEmpty = true;
    form.storageIndex = storage.getIndex(form.element);
  }

  renderDeleteConfirm() {
    return `
        <div class="delete-confirm">
        <div class="message">Удалить?</div>
        <button type="button" class="btn btn-delete-submit">ОК</button>
        <button type="button" class="btn btn-delete-cancel">Отменить</button>
        </div>
        `;
  }

  getData(event) {
    let parentRow = event.target.closest(".goods-item");
    let name = parentRow.querySelector(".name").textContent.trim();
    let price = parentRow.querySelector(".price").textContent.trim();
    return { parentRow, name, price };
  }

  deleteIconsOnClick(e) {
    e.stopImmediatePropagation();
    const { name, price } = this.getData(e);
    this.storageIndex = storage.storage.findIndex(
      (item) => item.name == name && item.price == price
    );
    if (this.storageIndex >= 0) {
      this.parent.insertAdjacentHTML("beforeend", this.renderDeleteConfirm());
      let confirmElement = document.querySelector(".delete-confirm");
      confirmElement.style.visibility = "visible";
      let confirmButton = document.querySelector(".btn-delete-submit");
      confirmButton.addEventListener("click", () => {
        storage.storage.splice(this.storageIndex, 1);
        storage.addToDom();
        confirmElement.remove();
      });
      let cancelButton = document.querySelector(".btn-delete-cancel");
      cancelButton.addEventListener("click", () => {
        confirmElement.remove();
      });
    }
  }
}
