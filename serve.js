const express = require('express');
const graphqlHTTP = require('express-graphql');
const dotenv = require('dotenv');


const app = express();
const schema = require('./schema')

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))


dotenv.config();

app.listen(4000);
console.log('Listening...');
// console.log('should be key', process.env.KEY);