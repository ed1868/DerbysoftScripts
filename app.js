const path = require('path');
const express = require('express');
const createError = require('http-errors');
const connectMongo = require('connect-mongo');
const expressSession = require('express-session');
const logger = require('morgan');
const passport = require('passport');
const serveFavicon = require('serve-favicon');
const bindUserToViewLocals = require('./middleware/bind-user-to-view-locals.js');
const passportConfigure = require('./passport-configuration.js');
const baseRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');

const app = express();

app.use(serveFavicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    store: connectMongo.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bindUserToViewLocals);



const axios = require('axios');


let one = [
  "PHXCV",
  "CUNHC",
  "CZMHA"
];



let hotelsTested = [];
let batchActive = [];

let hotelsActivated = 0;
let hunger = 0;

activateHotel = (id,provider) => {
  let hotelToActivate = id;
  console.log('el id : ', id)
  console.log('el provider : ', provider)
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
          supplierId: `${provider}`,
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
        }, 7000)
      }
      if (err && err.code == "ETIMEDOUT") {
        console.log(':::::::::::::ETIMEDOUT ERROR :::::::::::::: ', err)
        setTimeout(function () {
          console.log(':::::::::::::::ERROR FIX SET TIME OUT ID :::::::::::::::::::::::::::::::', id)
          activateHotel(id)
        }, 7000)

      }

      if (err && err.response) {
        if (err.response.status) {
          if (err.response.status == "429") {
            setTimeout(() => {
              console.log(':::::::::::::::ERROR FIX SET TIME OUT ID :::::::::::::::::::::::::::::::', id);
              activateHotel(id);
            }, 6000)
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
  await activateHotel(hotelId,provider);
}

async function getAllHotels() {
  const apiPromises = one.map(getActivation)

  await Promise.all(apiPromises)
}


getAllHotels()

app.use('/', baseRouter);
app.use('/authentication', authenticationRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ type: 'error', error: { message: error.message } });
});

module.exports = app;
