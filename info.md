[...form.elements].forEach((element) => {
    console.dir(element);
})

validity: ValidityState

ValidityState.prototype ==>

Object.keys(ValidityState.prototype);


[...elements].forEach((element) => {
    console.dir(element);
    Object.keys(ValidityState.prototype).forEach((key) => {
    if (element.validity[key]) {
        console.log(key);
      }
    })
});