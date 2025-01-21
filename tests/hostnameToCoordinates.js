// const cells = { obj1 : {}, obj2 :{}, obj3:{}, obj4: {}, obj5: {}, obj6: {}, obj7: {}, obj8: {}, obj9: {} };
// const gridSize = Math.ceil(Math.sqrt(Object.entries(cells).length)); // .length ?
// console.log('grid size :', gridSize);
// for (let i = 1 ; i <= gridSize ; i++) {
//   for (let j = 1 ; j <= gridSize ; j++) {
// // hostname = JSON.stringify(i) + JSON.stringify(j) // ou alors 
//     const hostname = `dotpi-dev-0${j}${i}`; // template srtings 
// console.log(hostname)
// }
// }
import assert from 'node:assert';
import test from 'node:test';
import { generateCoordinates } from '../src/utils/hostnameToCoordinates.js';

test('stuff', () => {
    const expected = new Map(Object.entries({
        'dotpi-dev-011': { x: 0, y: 0 },
        'dotpi-dev-021': { x: 1, y: 0 },
        'dotpi-dev-012': { x: 0, y: 1 },
        'dotpi-dev-022': { x: 1, y: 1 },
    }));
    const result = generateCoordinates(2);

    assert.deepEqual(result, expected);
});