const express = require('express');
const router = express.Router();
const routeGuard = require('./../middleware/route-guard');
const IhgHotels = require('../json/ihgHotels');
const IhgTwo = require('../json/ihgTwo');

const axios = require('axios');


let one = [
"LAXWM"
];

let two = [

]

let three = [];


let hotelsTested = [];
let batchActive = [];

let hotelsActivated = 0;
let hunger = 0;

// IhgTwo.map(hotel => {
//   // console.log(hotel)
//   if (hotel.hotelId) {
//     one.push(hotel.hotelId)
//   } else {
//     return;
//   }
// })

activateHotel = (id, provider) => {
  let hotelToActivate = id;
  console.log('el id : ', id)
  // console.log('el provider : ', provider)

  let ihgProvider = "IHG"
  console.log('el provider : ', ihgProvider)
  axios({
    method: "post",
    url: `https://go-us.derbysoftsec.com/api/go/shoppingengine/v4/hotels/${provider}/setup`,
    headers: {
      Authorization:
        "zCc23JLtqCPO2Lzn9S000001f6bce9a3dbad4505b04bfc014a6429b6",
    },
    data: {
      header: {
        Authorization:
          "zCc23JLtqCPO2Lzn9S000001f6bce9a3dbad4505b04bfc014a6429b6",

        distributorId: "OVERSEAS",
        version: "v4",
        token:
          "zCc23JLtqCPO2Lzn9S000001f6bce9a3dbad4505b04bfc014a6429b6",
      },
      hotels: [
        {
          supplierId: ihgProvider,
          hotelId: hotelToActivate,
          status: "Actived",
        },
      ],
    },
  })
    .then((payload) => {
      if (payload.status == "200") {
        if (payload.data.hotelCount) {
          hunger += 1;
          batchActive.push(id);
        }
        hotelsTested.push(id);

        hotelsActivated += 1;
        console.log(`HOTEL ${id} HAS BEEN ACTIVATED ::::: `, id);

        console.log('PAYLOAD DATA : ', payload.data)
      }


      console.log(`TOTAL HOTELS ACTIVATED ${hotelsActivated} `);
      console.log(`TOTAL NEW HOTEL ACTIVATION ${hunger} `);
      // console.log('THE FINAL ARRAY FROM PROPERTIES LOADED : ::::: ', batchActive)


    })
    .catch((err) => {

      if (err && err.code == "ECONNREFUSED") {
        console.log(':::::::::::::ECONNREFUSED ERROR :::::::::::::: ', err)
        setTimeout(function () {
          console.log(':::::::::::::::ERROR FIX SET TIME OUT ID :::::::::::::::::::::::::::::::', id)
          activateHotel(id)
        }, 10000)
      }
      if (err && err.code == "ETIMEDOUT") {
        console.log(':::::::::::::ETIMEDOUT ERROR :::::::::::::: ', err)
        setTimeout(function () {
          console.log(':::::::::::::::ERROR FIX SET TIME OUT ID :::::::::::::::::::::::::::::::', id)
          activateHotel(id)
        }, 10000)

      }

      if (err && err.response) {
        if (err.response.status) {
          if (err.response.status == "429") {
            setTimeout(() => {
              console.log(':::::::::::::::ERROR FIX SET TIME OUT ID :::::::::::::::::::::::::::::::', id);
              activateHotel(id);
            }, 10000)
          }
        }
      }

      if (err && !err.response) {
        console.log('no error response ');
      }
    });
};

async function getActivation(hotelId) {
  const provider = "IHG";
  await activateHotel(hotelId, provider);
}

async function getAllHotels() {
  const apiPromises = one.map(getActivation)

  await Promise.all(apiPromises)
}

// console.log(one);
getAllHotels()



router.get('/', (req, res, next) => {
  res.json({ type: 'success', data: { title: 'Hello World' } });
});

router.get('/activateHotels', (req, res, next) => {
  res.json({ type: 'success', data: { title: 'Hello World' } });
});

router.get('/private', routeGuard, (req, res, next) => {
  res.json({});
});

module.exports = router;
