import http from "http";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const port = 8080;
const host = "localhost";

const app = express();
app.use(bodyParser.json());
function char() {
     // create random string 5  characters long
     return Math.random().toString(36).substr(2, 5);
}
app.post('/api/message', (req, res) => {
     const msg = req.body;
     console.log(msg)
     switch (msg.type) {
          case 'create':
               fs.readFile("links.json", "utf8", (err, data) => {
                    let parse = JSON.parse(data); // Parse the JSON string into an object
                    console.log(parse)
                    if (Object.values(parse).includes(msg.url)) {
                         const conflictingEntries = Object.entries(parse)
                              .filter(([key, value]) => value === msg.url)
                              .map(([key, value]) => ({ key, value }));
                         const fullUrl = `http://${req.get('host')}/l/${conflictingEntries[0].key}`;
                         res.json({
                              error: '1',
                              status: `Created! - ${fullUrl}`,
                              link: fullUrl
                         });
                    }
                    else {
                         let p = char();
                         parse[p] = msg.url; // Use msg.url instead of (data.url)
                         fs.writeFile("links.json", JSON.stringify(parse), (err) => {
                              if (err) {
                                   res.status(500).json({ error: true, status: "Error writing to file" });
                              } else {
                                   const fullUrl = `http://${req.get('host')}/l/${p}`;
                                   res.json({ error: false, status: `Created! - ${fullUrl}`, link: fullUrl });
                              }
                         });
                    }
               });
               break;
     }
});

app.use((req, res) => {
     if (req.url.startsWith('/l/')) {
          let pars = req.url.replace('/l/', '');
          console.log(pars)
          fs.readFile("links.json", "utf8", (err, data) => {
               let parsed = JSON.parse(data)
               Object.keys(parsed).forEach(x => {
                    if (x === pars) res.redirect(parsed[pars])
               })
          })
     } else {
          fs.readFile("short.html", "utf8", (err, data) => {
               res.write(data);
               res.end();
          });
     }
});

const server = http.createServer(app);

server.listen(port, host, () => {
     console.log(`Server is running on http://${host}:${port}`);
});
