// associer un hostname à des coordonnées

// Set() method?
// Map() method --> fonctionne pour des paires key value
// const map1 = new Map();
// map1.set("11", {x: 0, y: 0})
// map1.set("12", {x: 1, y: 0})


// const hostname = "dotpi-dev-011";
// x = hostname.substr(11,1) - 1 ; // autre option méthode substring() : retourne la partie d'une chaîne de caractères comprise entre l'indice de départ et indice d'arrivée (ou fin si non précisé).
// y = hostname.substr(12) - 1 ;

// cells = await server.StateManager.getCollection ('cell'); // en fait ça ne va pas marcher car ça change dès qu'un client se connecte potentiellement
// const gridSize = Math.ceil(Math.sqrt(cells.length));
// for (let i = 1 ; i <= gridSize ; i++) {
//  for (let j = 1 ; j <= gridSize ; j++) {
//  hostname = "dotpi-dev-0" + i.toString() + j.toString() ;
//  hostname = `dotpi-dev-0${j}${i}`; // façon plus moderne -> template strings (ou template literals)
//  }
// }

export function generateHostnamesToCoordinates(gridSize) {
  const cellsCoordinates = new Map();

  for (let i = 1 ; i <= gridSize ; i++) {
    for (let j = 1; j <= gridSize; j++) {
      let basename;
      switch (`${j}${i}`) {
        case '32':
        case '33':
        case '34':
        case '36':
        case '41':
        case '52':
        case '66':
          basename = 'murmures';
          break;
        default:
          basename = 'dev'
          break;
      }
      const hostname = `dotpi-${basename}-0${j}${i}`;
      cellsCoordinates.set(hostname, {x : j-1, y : i-1})
    }
  }

  return cellsCoordinates;
}

export function generateCoordinates(gridSize){
  const cellsCoordinates = [];

  for (let i = 1 ; i <= gridSize ; i++) {
    for (let j = 1 ; j <= gridSize ; j++) {
      cellsCoordinates.push({x : j-1, y: i-1})
    }
  }
  return cellsCoordinates
}

// export const clientsCoordinates = {
//    "dotpi-dev-011": { x: 0, y: 0 },
//    "dotpi-dev-012": { x: 1, y: 0 },
//    "dotpi-dev-013": { x: 2, y: 0 },
//    "dotpi-dev-014": { x: 3, y: 0 },
//    "dotpi-dev-015": { x: 4, y: 0 },
//    "dotpi-dev-016": { x: 5, y: 0 },

//    "dotpi-dev-021": { x: 0, y: 1 },
//    "dotpi-dev-022": { x: 1, y: 1 },
//    "dotpi-dev-023": { x: 2, y: 1 },
//    "dotpi-dev-024": { x: 3, y: 1 },
//    "dotpi-dev-025": { x: 4, y: 1 },
//    "dotpi-dev-026": { x: 5, y: 1 },

//    "dotpi-dev-031": { x: 0, y: 2 },
//    "dotpi-dev-032": { x: 1, y: 2 },
//    "dotpi-dev-033": { x: 2, y: 2 },
//    "dotpi-dev-034": { x: 3, y: 2 },
//    "dotpi-dev-035": { x: 4, y: 2 },
//    "dotpi-dev-036": { x: 5, y: 2 },

//    "dotpi-dev-041": { x: 0, y: 3 },
//    "dotpi-dev-042": { x: 1, y: 3 },
//    "dotpi-dev-043": { x: 2, y: 3 },
//    "dotpi-dev-044": { x: 3, y: 3 },
//    "dotpi-dev-045": { x: 4, y: 3 },
//    "dotpi-dev-046": { x: 5, y: 3 },

//    "dotpi-dev-051": { x: 0, y: 4 },
//    "dotpi-dev-052": { x: 1, y: 4 },
//    "dotpi-dev-053": { x: 2, y: 4 },
//    "dotpi-dev-054": { x: 3, y: 4 },
//    "dotpi-dev-055": { x: 4, y: 4 },
//    "dotpi-dev-056": { x: 5, y: 4 },

//    "dotpi-dev-061": { x: 0, y: 5 },
//    "dotpi-dev-062": { x: 1, y: 5 },
//    "dotpi-dev-063": { x: 2, y: 5 },
//    "dotpi-dev-064": { x: 3, y: 5 },
//    "dotpi-dev-065": { x: 4, y: 5 },
//    "dotpi-dev-066": { x: 5, y: 5 },
// };
