const express = require('express');
const graphqlHTTP = require('express-graphql');
const app = express();
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const DataLoader = require('dataloader');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);




const schema = require('./schema')

const fetchAuthorByID = id =>
    fetch(`https://www.goodreads.com/author/show/${id}?format=xml&key=19fgqrJQRhH60l8LRx8ug`)
    .then(response => response.text())
    .then(parseXML)

const fetchBookByID = id =>
fetch(`https://www.goodreads.com/book/show/${id}?format=xml&key=19fgqrJQRhH60l8LRx8ug`)
    .then(response => response.text())
    .then(parseXML)


app.use('/graphql', graphqlHTTP(req => {
    // DataLoader constructor takes one argument which takes a function of an array of keys which returns values for each key
    const authorLoader = new DataLoader(keys => Promise.all(keys.map(fetchAuthorByID)))
    const bookLoader = new DataLoader(keys => Promise.all(keys.map(fetchBookByID)))

    return {
        schema,
        context: {
            authorLoader,
            bookLoader
        },
        graphiql: true
    }

}))


dotenv.config();

app.listen(4000);
console.log('Listening...');
