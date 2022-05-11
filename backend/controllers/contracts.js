const Contract = require("../models/Contract");

exports.createContract = (req, res, next) => {
  delete req.body._id;
  if (
    req.body.chain === "" ||
    req.body.address === "" ||
    req.body.type === "" ||
    req.body.decimals === "" ||
    req.body.name === ""
  ) {
    throw Error("Bad request");
  }
  const contract = new Contract({
    ...req.body,
  });
  contract
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.getAllContracts = (req, res, next) => {
  Contract.find()
    .then((contracts) => {
      res.status(200).json(contracts);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.deleteContract = (req, res, next) => {
  Contract.findOne({ _id: req.params.id }).then((contract) => {
    if (!contract) {
      return res.status(404).json({
        error: new Error("Objet non trouvé !"),
      });
    }
    Contract.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "Objet supprimé !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
