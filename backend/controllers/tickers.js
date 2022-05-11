const Ticker = require("../models/Ticker");

exports.createTicker = (req, res, next) => {
  delete req.body._id; // on supp le faux id envoyé par le front end
  const ticker = new Ticker({
    ...req.body,
  });
  ticker
    .save() //pour enregistrer dans la bdd
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.getAllTickers = (req, res, next) => {
  Ticker.find()
    .then((tickers) => {
      res.status(200).json(tickers);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.deleteTicker = (req, res, next) => {
  Ticker.findOne({ _id: req.params.id }).then((ticker) => {
    if (!ticker) {
      return res.status(404).json({
        error: new Error("Objet non trouvé !"),
      });
    }
    Ticker.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "Objet supprimé !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
