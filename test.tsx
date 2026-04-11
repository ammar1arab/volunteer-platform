// const numbers: number[] = [1, 2, 3, 4, 5];
// const newArray = numbers.map((x: number) =>  {
//     x * 2
// })

// newArray.forEach((a) => {
//     console.log(a);
// })

const orders = [
    { itemNo: "A1", qty: 5, bonus: 2 },
    { itemNo: "A2", qty: 3, bonus: 1 },
    { itemNo: "A1", qty: 4, bonus: 0 },
];

const reduceFun = orders.reduce((acc, ele) =>
    acc + ele.bonus + ele.qty
    , 0);


console.log(reduceFun)