'use strict';
// Load Environment Variables from the .env file

require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');//Database

// Application Setup
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors());//anyone can touch my server
const client = new pg.Client(process.env.DATABASE_URL)

//General Route
app.get('/', (req, res) => {
    res.status(200).send('You are in');
})

// Route Definitions

// http://localhost:3000/location?city=amman
app.get('/location', hitLocation);
app.get('/weather',hitWeather);
app.get('/trails',hitTrails);
app.get('/movies', hitMovies);
app.get('/data', displayDB);

// Route Handlers
function displayDB(req, res) {
    let SQL = `SELECT * FROM cityData;`;
    client.query(SQL)
        .then(results => {

            res.status(200).json(results.rows);
        })
};

function hitLocation(req, res) {
    const city = req.query.city;
    checklocation(city)
        .then(data => {
            if (!data.rows.length) { //instead 'rows.length' we can use 'rowCount' 
                getLocation(city)
                    .then(data => {

                        res.status(200).json(data);
                        let SQL = `INSERT INTO cityData (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
                        let safeValues = [data.search_query, data.formatted_query, data.latitude, data.longitude];
                        client.query(SQL, safeValues);
                    });

            } else res.status(200).json(data.rows[0]);
        });

};

function checklocation(city) {
    let SQL = `SELECT * FROM cityData WHERE search_query='${city}'`

    return client.query(SQL);
}

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
    const lon = req.query.longitude;

    getWeather(lat, lon)
        .then(data => {

            res.status(200).json(data);
        });
};
function getWeather(lat, lon) {


    let key = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;
    return superagent.get(url)
        .then(data => {

            let generatData = data.body.data.map((element, i) => {
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


function hitTrails(req, res) {
    const lat = req.query.latitude;
    const lon = req.query.longitude;
    getTrials(lat, lon)
        .then(data => {
            res.status(200).json(data);
        });
}

function getTrials(lat, lon) {
    let key = process.env.TRAIL_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${key}`;
    return superagent.get(url)
        .then(data => {

            let trialData = data.body.trails.map((ele, i) => {
                const creatTrail = new Trial(ele);
                return creatTrail;
            });
            return trialData;

        });
}


function Trial(params) {
    this.name = params.name;
    this.location = params.location;
    this.length = params.length;
    this.stars = params.stars;
    this.star_votes = params.starVotes;
    this.summary = params.summary;
    this.trail_url = params.url;
    this.condition = params.conditionStatus;
    this.condition_date = params.conditionDate.slice(0, 10);
    this.condition_time = params.conditionDate;
};

function hitMovies(req, res) {
    const city = req.query.city;
    getMovies(city)
        .then(data => {
            res.status(200).json(data);
        });
};
function getMovies(city) {
    let key = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}&language=en-US`;
    return superagent.get(url)
        .then(data => {
            let moviesInLocation=data.body.results.map(ele=>{
                let creatMovie=new Movie(ele);
                return creatMovie;
            });
            return moviesInLocation;
        });
};
function Movie(obj) {
    this.title = obj.title;
    this.overview = obj.overview;
    this.average_votes = obj.vote_average;
    this.total_votes = obj.vote_count;
    this.image_url =`https://image.tmdb.org/t/p/w500${obj.poster_path}`;
    this.popularity = obj.popularity;
    this.released_on = obj.release_date;

}


app.get('*', (req, res) => {
    res.send('not fond');
});

app.use((error, req, res) => {
    res.status(500).send(error);
});
// app.listen(PORT, () => {
//     console.log(`port ${PORT}`);
// });

// To connect the client 
client.connect()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`listening on ${PORT}`)
        );
    })

