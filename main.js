/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/listeditor/goods.js
class Goods {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}
;// CONCATENATED MODULE: ./src/js/listeditor/tooltip.js
class Tooltip {
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
      element: tooltipElement
    });
    document.body.appendChild(tooltipElement);
    const {
      right,
      top
    } = element.getBoundingClientRect();
    tooltipElement.style.left = right + 5 + "px";
    tooltipElement.style.top = top + element.offsetHeight / 2 - tooltipElement.offsetHeight / 2 + "px";
    return id;
  }
  removeTooltip(id) {
    const tooltip = this.tooltips.find(el => el.id === id);
    if (tooltip) {
      tooltip.element.remove();
    }
    this.tooltips = this.tooltips.filter(el => el.id !== id);
  }
}
;// CONCATENATED MODULE: ./src/js/listeditor/storage.js

class Storage {
  constructor() {
    this.storage = [];
  }
  addToDom() {
    let goodsList = new GoodsList(".goods-list");
    for (let el of goodsList.getAllItems()) {
      el.remove();
    }
    for (let item of this.storage) {
      goodsList.addToDom(goodsList.renderItem(item.name, item.price));
    }
  }
  getIndex(form) {
    let targetIndex = this.storage.findIndex(item => item.name == form.name.value && item.price == form.price.value);
    return targetIndex;
  }
}
let storage = new Storage();
;// CONCATENATED MODULE: ./src/js/listeditor/form.js



const errors = {
  name: {
    valueMissing: "Необходимо добавить название товара"
  },
  price: {
    valueMissing: "Добавьте стоимость товара",
    patternMismatch: "Допустимо вводить только цифры больше 0"
  }
};
class Form {
  constructor() {
    this.parent = document.querySelector(".goods");
    this.addForm();
    this.element = document.querySelector(".form");
    this.cancelButton = document.querySelector(".btn-cancel");
    this.tooltipFactory = new Tooltip();
    this.actualMessages = [];
    this.makeVisible = this.makeVisible.bind(this);
    this.getError = this.getError.bind(this);
    this.elementOnBlur = this.elementOnBlur.bind(this);
    this.onClickCancelButton = this.onClickCancelButton.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.notEmpty = false;
    this.storageIndex = null;
    this.cancelButton.addEventListener("click", this.onClickCancelButton);
    this.element.addEventListener("submit", this.onFormSubmit);
    [...this.element.elements].forEach(el => el.addEventListener("focus", () => {
      el.addEventListener("blur", this.elementOnBlur);
    }));
  }
  renderForm() {
    return `
    <form class="form" novalidate>
    <div class="form-control">
      <label for="name">Название</label>
      <br>
      <input name="name" id="name" class="input name" type="text" required>
    </div>
    <div class="form-control">
      <label for="price">Стоимость</label>
      <br>
      <input name="price" id="price" class="input price" pattern="^[1-9][0-9]*$" required>
    </div>
    <button type="submit" class="btn btn-submit">Сохранить</button>
    <button type="reset" class="btn btn-cancel">Отмена</button>
  </form>
    `;
  }
  addForm() {
    this.parent.insertAdjacentHTML("beforeend", this.renderForm());
  }
  deleteForm() {
    this.tooltipFactory.tooltips.forEach(tooltip => {
      this.tooltipFactory.removeTooltip(tooltip.id);
    });
    this.element.remove();
  }
  makeVisible() {
    this.element.style.visibility = "visible";
  }
  onClickCancelButton() {
    this.deleteForm();
  }
  onFormSubmit(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (this.element.checkValidity()) {
      let name = this.element.name.value;
      let price = this.element.price.value;
      if (this.notEmpty && this.storageIndex >= 0) {
        storage.storage[this.storageIndex].name = name;
        storage.storage[this.storageIndex].price = Number(price);
        storage.addToDom();
        this.element.remove();
      } else {
        let newGoods = new Goods(name, Number(price));
        storage.storage.push(newGoods);
        storage.addToDom();
        this.element.reset();
        return;
      }
    }
    const elements = this.element.elements;
    [...elements].some(elem => {
      const error = this.getError(elem);
      if (error) {
        this.showTooltip(error, elem);
        return true;
      }
    });
  }
  elementOnBlur(e) {
    const el = e.target;
    const error = this.getError(el);
    if (error) {
      this.showTooltip(error, el);
    } else {
      const currentErrorMessage = this.actualMessages.find(item => item.name === el.name);
      if (currentErrorMessage) {
        this.tooltipFactory.removeTooltip(currentErrorMessage.id);
        this.actualMessages = this.actualMessages.filter(elem => elem.name !== el.name);
      }
    }
    el.removeEventListener("blur", this.elementOnBlur);
  }
  showTooltip(message, el) {
    let checkTooltip = this.tooltipFactory.getAll().some(item => item.textContent.trim() === message);
    if (!checkTooltip) {
      if (!this.actualMessages.find(elem => elem.name === el.name)) {
        this.actualMessages.push({
          name: el.name,
          id: this.tooltipFactory.showTooltip(message, el)
        });
      }
    }
  }
  getError(el) {
    const errorKey = Object.keys(ValidityState.prototype).find(key => {
      if (!el.name) return;
      if (key === "valid") return;
      return el.validity[key];
    });
    if (!errorKey) return;
    return errors[el.name][errorKey];
  }
}
;// CONCATENATED MODULE: ./src/js/listeditor/actions.js


class Actions {
  constructor() {
    this.parent = document.querySelector(".goods");
    this.changeIcons = [...document.querySelectorAll(".edit")];
    this.deleteIcons = [...document.querySelectorAll(".delete")];
    this.changeIconsOnClick = this.changeIconsOnClick.bind(this);
    this.deleteIconsOnClick = this.deleteIconsOnClick.bind(this);
    this.changeIcons.forEach(item => item.addEventListener("click", this.changeIconsOnClick));
    this.deleteIcons.forEach(item => item.addEventListener("click", this.deleteIconsOnClick));
  }
  changeIconsOnClick(e) {
    e.stopImmediatePropagation();
    const {
      name,
      price
    } = this.getData(e);
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
    return {
      parentRow,
      name,
      price
    };
  }
  deleteIconsOnClick(e) {
    e.stopImmediatePropagation();
    const {
      name,
      price
    } = this.getData(e);
    this.storageIndex = storage.storage.findIndex(item => item.name == name && item.price == price);
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
;// CONCATENATED MODULE: ./src/js/listeditor/goodslist.js


class GoodsList {
  constructor(goodsList) {
    if (typeof goodsList === "string") {
      goodsList = document.querySelector(goodsList);
    }
    this.goodsList = goodsList;
    this.renderItem = this.renderItem.bind(this);
    this.items = [...document.querySelectorAll(".goods-item")];
    this.add = document.querySelector(".add");
    this.onClickAdd = this.onClickAdd.bind(this);
    this.add.addEventListener("click", this.onClickAdd);
  }
  getAllItems() {
    return this.items;
  }
  renderItem(name, price) {
    let htmlItem = `
    <tr class='goods-item'>
    <td class="name">${name}</td>
    <td class="price">${price}</td>
    <td class="actions">
      <div class="action edit">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
      </div>
      <div class="action delete">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
      </div>
    </td>
  </tr>
    `;
    return htmlItem;
  }
  addToDom(item) {
    const parentEl = document.querySelector("tbody");
    parentEl.insertAdjacentHTML("beforeend", item);
    new Actions();
  }
  onClickAdd() {
    let checkForm = document.querySelector(".form");
    if (!checkForm) {
      let form = new Form();
      form.makeVisible();
    }
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

document.addEventListener("DOMContentLoaded", () => {
  new GoodsList(".goods-list");
});
;// CONCATENATED MODULE: ./src/index.js



/******/ })()
;