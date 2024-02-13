function manageRequest(request, response) {
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    if (filePath[2] === "status") {
        response.statusCode = 200;
        response.end(`Ok`);
    }
    else {
        response.statusCode = 404;
        response.end(`Not Found`);
    }
}

exports.manage = manageRequest;