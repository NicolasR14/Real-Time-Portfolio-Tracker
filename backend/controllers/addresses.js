const Address = require("../models/Address");

exports.createAddress = (req, res, next) => {
  delete req.body._id; // on supp le faux id envoyé par le front end
  const address = new Address({
    ...req.body,
  });
  address
    .save() //pour enregistrer dans la bdd
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.getAllAddresses = (req, res, next) => {
  Address.find()
    .then((addresses) => {
      res.status(200).json(addresses);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.deleteAddress = (req, res, next) => {
  Address.findOne({ _id: req.params.id }).then((address) => {
    if (!address) {
      return res.status(404).json({
        error: new Error("Objet non trouvé !"),
      });
    }
    Address.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "Objet supprimé !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
