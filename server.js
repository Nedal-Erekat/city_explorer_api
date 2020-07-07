'use strict';
// Load Environment Variables from the .env file

require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors());//anyone can touch my server

//General Route
app.get('/', (req, res) => {
    res.status(200).send('You are in');
})

// Route Definitions

// http://localhost:3000/location?data=amman
app.get('/location', hitLocation);
app.get('/weather',hitWeather);
app.get('/trails',hitTrails);

// Route Handlers

function hitLocation(req, res) {
    const city = req.query.city;
    getLocation(city)
        .then(data => {

            res.status(200).json(data);
        });
};

function getLocation(city) {
    let key = process.env.GEOCODE_API_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

    return superagent.get(url)
        .then(data => {            
            const creatLocation = new Location(city, data.body);
            return creatLocation;
        });

};
Location.all=[];
function Location(city, getData) {
    this.search_query = city;
    this.formatted_query = getData[0].display_name;
    this.latitude = getData[0].lat;
    this.longitude = getData[0].lon;
    Location.all.push(this);
}

function hitWeather(req, res) {
        getWeather()
    .then(data=>{
        
        res.status(200).json(data);
    });     
};
function getWeather() {
    // console.log(Location.all);
    
    let key=process.env.WEATHER_API_KEY;
    let url=`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${Location.all[0].latitude}&lon=${Location.all[0].longitude}&key=${key}`;
    return superagent.get(url)
    .then(data=>{        
        let generatData =data.body.data.map((element,i) => {
            const creatWeather = new Weather(element);
            return creatWeather;
        });
        return generatData;
    })
}


function Weather(weatherData) {

    this.forecast = weatherData.weather.description;
    this.time = weatherData.datetime;
};


function hitTrails(req,res) {
    getTrials()
    .then(data=>{
        res.status(200).json(data);
    });
}

function getTrials() {
    let key=process.env.TRAIL_API_KEY;
    let url=`https://www.hikingproject.com/data/get-trails?lat=${Location.all[0].latitude}&lon=${Location.all[0].longitude}&key=${key}`;
    return superagent.get(url)
    .then(data=>{
        console.log('Here it is the data:>>>>>>>>>'+ data.body.trails);
        
        let trialData=data.body.trails.map((ele,i)=>{
            const creatTrail= new Trial(ele)
            return creatTrail;
        });
        return trialData;

    });
}

// {
//     "name": "Mt. Si",
//     "location": "Tanner, Washington",
//     "length": "6.6",
//     "stars": "4.4",
//     "star_votes": "72",
//     "summary": "A steep, well-maintained trail takes you atop Mt. Si with outrageous views of Puget Sound.",
//     "trail_url": "https://www.hikingproject.com/trail/7001016/mt-si",
//     "conditions": "Dry",
//     "condition_date": "2018-07-22",
//     "condition_time": "0:17:22 "
//   },
function Trial(params) {
    this.name=params.name;
    this.location=params.location;
    this.length=params.length;
    this.stars=params.stars;
    this.star_votes=params.star_votes;
    this.summary=params.summary;
    this.trail_url=params.trail_url;
    this.condition=params.condition;
    this.condition_date=params.condition_date;
    this.condition_time=params.condition_time;
}


app.get('*', (req, res) => {
    res.send('not fond');
});

app.use((error, req, res) => {
    res.status(500).send(error);
});
app.listen(PORT, () => {
    console.log(`port ${PORT}`);
});

