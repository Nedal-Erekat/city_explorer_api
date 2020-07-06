'use strict';
//dependensies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3030;
const app = express();
app.use(cors());//anyone can touch my server

app.get('/',(req,res)=>{
    res.status(200).send('You are in');
})
// http://localhost:3000/location?data=amman
app.get('/location',(req,res)=>{
    const city=req.query.data;
    const getData= require('./data/location.json');
    // console.log(getData);
    const creatLocation=new Location(city,getData);

    res.send(creatLocation);
});

function Location(city,getData) {
    // {
    //     "search_query": "seattle",
    //     "formatted_query": "Seattle, WA, USA",
    //     "latitude": "47.606210",
    //     "longitude": "-122.332071"
    //   }
    this.search_query=city;
    this.formatted_query=getData[0].display_name;
    this.latitude=getData[0].lat;
    this.longitude=getData[0].lon;
}
app.get('*',(req,res)=>{
    res.send('not fond');
});

app.use((error,req,res)=>{
    res.status(500).send(error);
});
app.listen(PORT, () => {
    console.log(`port ${PORT}`);
});

