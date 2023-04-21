const {MongoClient} = require('mongodb');
var http = require('http');
var port = process.env.PORT || 3000;
var url = require('url');
var fs = require("fs");

const uri = "mongodb+srv://boylannickolas3:Tufts2023CS20@cluster0.7ds9gmm.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
    try {
        // Create a filestream
        await http.createServer(async function (req, res) {
            // First check if we are on home page or process page
            if (req.url == "/") {
                file = 'form.html';
                fs.readFile(file, function(err, txt) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(txt);
                    res.end();
                });
            } else {
                // Connect to database first
                await client.connect();
                const companyDB = await client.db("stocks");
                const companies = await companyDB.collection("companies");

                // Write header and grab the form data
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write("<style>body {margin: 10px 0; text-size: 20px; padding-left: 10px} a:hover {cursor: pointer;} a {display: inline-block; text-decoration: none; color: inherit; border: 1px solid #000; background-color: #D3D3D3; padding: 5px; margin-top: 25px;}</style>");
                res.write("<title>Search Results</title>");
                var qobj = await url.parse(req.url, true).query;
                var choice = qobj.symb_or_name;
                var company = qobj.textBox;

                // Check if the ticker or name was searched
                if (choice == "symbol") {
                    var result = await companies.find({ticker: company});

                    // Make sure at least one result was returned
                    if (await companies.countDocuments({ticker: company}) == 0) {
                        // No match
                        res.write("<h1>No match was found. Please try again.</h1>");
                    } else {
                        res.write("<h1>Search results for companies with the stock ticker: " + company + "</h1>");

                        await result.forEach(function(search) {
                            res.write("<div style='border-bottom: 1px solid #fff;'>");
                            res.write("<h2 style='margin: 10px 0 5px 0;'>" + search["name"] + "</h2>");
                            res.write("Stock Ticker Symbol: " + search["ticker"]);
                            res.write("<br>Current Price: " + search["price"]);
                            res.write("</div>");
                        });
                    }
                } else { 
                    var result = await companies.find({name: company});

                    // Make sure at least one match was found
                    if (await companies.countDocuments({name: company}) == 0) {
                        // No match
                        res.write("<h1>No match was found. Please try again.</h1>");
                    } else {
                        res.write("<h1>Search results for companies with the name: " + company + "</h1>");

                        await result.forEach(function(search) {
                            res.write("<div style='border-bottom: 1px solid #fff;'>");
                            res.write("<h2 style='margin: 10px 0 5px 0;'>" + search["name"] + "</h2>");
                            res.write("Stock Ticker Symbol: " + search["ticker"]);
                            res.write("<br>Current Price: " + search["price"]);
                            res.write("</div>");
                        });
                    }
                }

                res.write("<a href='./' target='_self'>Go Back</a>")
                res.end();
            }
        }).listen(port);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

