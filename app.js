const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const config = require('./routes/config.routes');
const jsonRoute = require('./routes/json-router.route');
const jsRoute = require('./routes/js-router');
const cors = require('cors');
const app = express();
app.set('port', process.env.PORT || 4000);

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/v1/config', config);
app.use('/api/', jsonRoute);
app.use('/api/', jsRoute);

app.use("/", express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(app.get('port'), '0.0.0.0', () => {
  console.log(`Server starting on => ${app.get('port')} `);
})

module.exports = app;
