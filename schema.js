const fetch = require('node-fetch');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList
} = require('graphql');

function translate(lang, str) {
    // Google Translate API is a paid (but dirt cheap) service. This is my key
    // and will be disabled by the time the video is out. To generate your own,
    // go here: https://cloud.google.com/translate/v2/getting_started
    const url =
        `https://www.googleapis.com/language/translate/v2?key=${process.env.API_KEY}&source=en&target=${lang}&q=${encodeURIComponent(str)}`;
        return fetch(url)
            .then(response => response.json())
            .then(parsedResponse =>
                parsedResponse
                .data
                .translations[0]
                .translatedText
            )
  }


const BookType = new GraphQLObjectType({
    name: 'Book',
    description: '...',

    fields: () => ({
        title:{
            type: GraphQLString,
            args: {
                lang: { type: GraphQLString}
            },
            resolve: (xml, args) => {
                const title = xml.GoodreadsResponse.book[0].title[0];
                return args.lang ? translate(args.lang, title) : title;
            }
        },
        isbn: {
            type: GraphQLString,
            resolve: xml => xml.GoodreadsResponse.book[0].isbn[0]
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: '...',

    fields: () => ({
        name: {
            type: GraphQLString,
            resolve: xml => (
                xml.GoodreadsResponse.author[0].name[0]
            )
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: xml => {
                const ids = xml.GoodreadsResponse.author[0].books[0].book.map(element => element.id[0]._)
                return Promise.all(ids.map(id =>
                    fetch(`https://www.goodreads.com/book/show/${id}?format=xml&key=19fgqrJQRhH60l8LRx8ug`)
                        .then(response => response.text())
                        .then(parseXML)
                ))
            }
        }
    })
})

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType ({
        name: 'Query',
        description: '...',

        fields: () => ({
            author: {
                type: AuthorType,
                args: {
                    id: { type: GraphQLInt}
                },
                resolve: (root, args) => (
                    fetch(
                        `https://www.goodreads.com/author/show/${args.id}?format=xml&key=19fgqrJQRhH60l8LRx8ug`
                    )
                )
                .then(response => response.text())
                .then(parseXML)
            }
        })
    })
})