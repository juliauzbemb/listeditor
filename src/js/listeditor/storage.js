import GoodsList from "./goodslist";

export default class Storage {
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
    let targetIndex = this.storage.findIndex(
      (item) => item.name == form.name.value && item.price == form.price.value
    );
    return targetIndex;
  }
}

export let storage = new Storage();
