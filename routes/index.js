var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // req.app.get('redisClient').lrange('log', 0, 10, (err, logs) => {
  //   if (err) console.log('err', err);
  //   // else console.log('log', logs);

  //   res.render('index', { title: 'Express', logs: logs || []});
  // });
  let client  = req.app.get('pgClient')
  client.query('SELECT * FROM "user"', (err, pgres) => {
    if (err) {
      console.log('err', err);
      res.render('index', { title: 'PG Error', logs: []});
    } else {
      let emails = pgres.rows.map(it => it.email.trim());
      // console.log('psql ----', pgres);
      res.render('index', { title: 'Express', logs: emails || []});
    }
    //client.end();
  });

});

router.post('/add', function(req, res, next) {
  console.log('req.body.email', req.body.email);
  let client = req.app.get('pgClient')
  client.query('INSERT INTO "user" (email) VALUES($1) RETURNING *', [req.body.email], (err, pgres) => {
    console.log('INSERT CB===', err, pgres);
    res.redirect('/');
  });
});

module.exports = router;
