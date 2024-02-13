// The http module contains methods to handle http queries.
const http = require('http');
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');
const kingofescape = require('./ia/kingofescape.js');

// Verify that functions are working
console.log(kingofescape.setup(1));
console.log(kingofescape.nextMove(3));
console.log(kingofescape.correction(4));
console.log(kingofescape.updateBoard(4));

const server = http.createServer(function (request, response) {

    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });


    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
        }
        else {
            fileQuery.manage(request, response);
        }
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);