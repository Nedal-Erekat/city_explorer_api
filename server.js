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
function Location(city, getData) {
    this.search_query = city;
    this.formatted_query = getData[0].display_name;
    this.latitude = getData[0].lat;
    this.longitude = getData[0].lon;
}

function hitWeather(req, res) {
    const lat = req.query.latitude;
    const lon= req.query.longitude;

        getWeather(lat,lon)
    .then(data=>{
        
        res.status(200).json(data);
    });     
};
function getWeather(lat,lon) {
    // console.log(Location.all);
    
    let key=process.env.WEATHER_API_KEY;
    let url=`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;
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
    const lat = req.query.latitude;
    const lon= req.query.longitude;
    getTrials(lat,lon)
    .then(data=>{
        res.status(200).json(data); 
    });
}

function getTrials(lat,lon) {
    let key=process.env.TRAIL_API_KEY;
    let url=`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${key}`;
    return superagent.get(url)
    .then(data=>{
        console.log('Here it is the data:>>>>>>>>>'+ data);
        // let trialData=[];
        // data.body.trails.forEach(ele => {
        // const creatTrail= new Trial(ele);
        //     trialData.push(creatTrail);
        // });
        
        
        let trialData=data.body.trails.map((ele,i)=>{
            const creatTrail= new Trial(ele);
            return creatTrail;
        });
        console.log('Here it is the trialData:>>>>>>>>>'+ trialData);
        return trialData;

    });
}


function Trial(params) {
    this.name=params.name;
    this.location=params.location;
    this.length=params.length;
    this.stars=params.stars;
    this.star_votes=params.starVotes;
    this.summary=params.summary;
    this.trail_url=params.url;
    this.condition=params.conditionStatus;
    this.condition_date=params.conditionDate.slice(0,10);
    this.condition_time=params.conditionDate;
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

