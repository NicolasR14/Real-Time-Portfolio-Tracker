const Histo = require("../models/Histo");

exports.getAllHisto = (req, res, next) => {
  Histo.find()
    .then((histos) => {
      histos.sort((a, b) => (a.day > b.day ? 1 : -1));
      res.status(200).json(histos);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};
