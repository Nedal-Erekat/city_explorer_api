'use strict';
//dependensies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');/////>>>>>>>>
require('dotenv').config();
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors());//anyone can touch my server

app.get('/', (req, res) => {
    res.status(200).send('You are in');
})
// http://localhost:3000/location?data=amman
app.get('/location', (req, res) => {

    const city = req.query.data;
    getLocation(city)
        .then(data => {

            res.send(data);
        })

});
function getLocation(city) {
    let key = process.env.LOCATION;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

    return superagent.get(url)
    .then(data=>{
        const creatLocation = new Location(city, data);
        return creatLocation;
    })

}
// // if(city==='Lynnwood'){
//     const getData= require('./data/location.json');


// // }else{
// res.status(500).send("Sorry, something went wrong");
// // }



function Location(city, getData) {
    // {
    //     "search_query": "seattle",
    //     "formatted_query": "Seattle, WA, USA",
    //     "latitude": "47.606210",
    //     "longitude": "-122.332071"
    //   }
    this.search_query = city;
    this.formatted_query = getData[0].display_name;
    this.latitude = getData[0].lat;
    this.longitude = getData[0].lon;
}
function Weather(weatherData) {
    // [
    //     {
    //       "forecast": "Partly cloudy until afternoon.",
    //       "time": "Mon Jan 01 2001"
    //     },
    //     {
    //       "forecast": "Mostly cloudy in the morning.",
    //       "time": "Tue Jan 02 2001"
    //     },
    //     ...
    //   ]
    this.forecast = weatherData.weather.description;
    this.time = weatherData.datetime;
}

app.get('/weather', (req, res) => {
    // const city = req.query.data;
    const getWeatherData = require('./data/weather.json');
    // console.log(getWeatherData.data[0].weather.description);
    let data = [];
    getWeatherData.data.forEach(element => {

        const creatWeather = new Weather(element);
        data.push(creatWeather);
    });
    res.send(data);

})



app.get('*', (req, res) => {
    res.send('not fond');
});

app.use((error, req, res) => {
    res.status(500).send(error);
});
app.listen(PORT, () => {
    console.log(`port ${PORT}`);
});

