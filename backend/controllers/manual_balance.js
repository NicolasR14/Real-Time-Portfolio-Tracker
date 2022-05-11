const ManBal = require("../models/Manual_balance");

exports.createManBal = (req, res, next) => {
  delete req.body._id;
  const man_bal = new ManBal({
    ...req.body,
  });
  man_bal
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error: error });
    });
};

exports.getAllManBal = (req, res, next) => {
  ManBal.find()
    .then((man_bals) => {
      res.status(200).json(man_bals);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.deleteManBal = (req, res, next) => {
  ManBal.findOne({ _id: req.params.id }).then((thing) => {
    if (!thing) {
      return res.status(404).json({
        error: new Error("Objet non trouvé !"),
      });
    }
    ManBal.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "Objet supprimé !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
