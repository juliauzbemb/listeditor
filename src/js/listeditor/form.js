import Goods from "./goods";
import Tooltip from "./tooltip";
import { storage } from "./storage";

const errors = {
  name: {
    valueMissing: "Необходимо добавить название товара",
  },
  price: {
    valueMissing: "Добавьте стоимость товара",
    patternMismatch: "Допустимо вводить только цифры больше 0",
  },
};

export default class Form {
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

    [...this.element.elements].forEach((el) =>
      el.addEventListener("focus", () => {
        el.addEventListener("blur", this.elementOnBlur);
      })
    );
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
    this.tooltipFactory.tooltips.forEach((tooltip) => {
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

    [...elements].some((elem) => {
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
      const currentErrorMessage = this.actualMessages.find(
        (item) => item.name === el.name
      );

      if (currentErrorMessage) {
        this.tooltipFactory.removeTooltip(currentErrorMessage.id);
        this.actualMessages = this.actualMessages.filter(
          (elem) => elem.name !== el.name
        );
      }
    }

    el.removeEventListener("blur", this.elementOnBlur);
  }

  showTooltip(message, el) {
    let checkTooltip = this.tooltipFactory
      .getAll()
      .some((item) => item.textContent.trim() === message);

    if (!checkTooltip) {
      if (!this.actualMessages.find((elem) => elem.name === el.name)) {
        this.actualMessages.push({
          name: el.name,
          id: this.tooltipFactory.showTooltip(message, el),
        });
      }
    }
  }

  getError(el) {
    const errorKey = Object.keys(ValidityState.prototype).find((key) => {
      if (!el.name) return;
      if (key === "valid") return;

      return el.validity[key];
    });

    if (!errorKey) return;

    return errors[el.name][errorKey];
  }
}
