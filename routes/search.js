const express = require('express');
const router = express.Router();
const searchModel = require('../models/search.model');

router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const results = await searchModel.search(query);
    res.render('admin', { data: results });
  } catch (error) {
    res.status(500).send('Error occurred: ' + error.message);
  }
});

module.exports = router;
