const {MongoClient} = require('mongodb');
var http = require('http');
var url = require('url');

const uri = "mongodb+srv://boylannickolas3:Tufts2023CS20@cluster0.7ds9gmm.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
    try {
        // Connect to the database
        await client.connect();
        const companyDB = await client.db("stocks");
        const companies = await companyDB.collection("companies");
        
        
        // Create a filestream
        await http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            var qobj = url.parse(req.url, true).query;
            var txt = qobj.textBox;
            res.write("The value is: " + txt);
            res.end();
        }).listen(8080);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);