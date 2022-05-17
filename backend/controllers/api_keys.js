const { parse } = require("mathjs");
const API_key = require("../models/API_key");
const { encrypt, decrypt } = require("./src/crypt");

exports.createAPI_key = (req, res, next) => {
  try {
    delete req.body._id;
    if (
      !req.body.name ||
      !req.body.api_key ||
      req.body.name === "" ||
      req.body.api_key === ""
    ) {
      throw Error("name ou key vide !");
    }
    if (req.body.name !== "kucoin" && req.body.api_passphrase) {
      throw Error("Ce CEX/Chain ne prend pas de paramètre api_passphrase");
    }
    if (req.body.name === "jm" && req.body.api_secret) {
      throw Error("Ce CEX/Chain ne prend pas de paramètre api_secret");
    }

    const api_key = new API_key({
      name: req.body.name,
      api_key: encrypt(req.body.api_key),
    });
    if (req.body.api_passphrase && req.body.api_passphrase !== "") {
      api_key.api_passphrase = encrypt(req.body.api_passphrase);
    }
    if (req.body.api_secret && req.body.api_secret !== "") {
      api_key.api_secret = encrypt(req.body.api_secret);
    }

    api_key
      .save()
      .then(() => res.status(200).json({ message: "Objet enregistré !" }))
      .catch((error) => {
        return error;
      });
  } catch (error) {
    if (error.message === "name ou key vide !") {
      res.status(400).json({ message: error.message });
      return;
    }
    console.log(error);
    res.status(400).json({ message: "Erreur inconnue" });
  }
};

exports.getAllAPI_key = (req, res, next) => {
  API_key.find()
    .then((api_keys) => {
      const _api_keys = JSON.parse(JSON.stringify(api_keys)).map((a) => {
        _api_key = { _id: a._id, name: a.name };
        _api_key.api_key = decrypt(a.api_key);
        if (a.api_secret) {
          _api_key.api_secret = decrypt(a.api_secret);
        }
        if (a.api_passphrase) {
          _api_key.api_passphrase = decrypt(a.api_passphrase);
        }
        return _api_key;
      });
      res.status(200).json(_api_keys);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

exports.deleteAPI_key = (req, res, next) => {
  API_key.findOne({ _id: req.params.id }).then((api_key) => {
    if (!api_key) {
      return res.status(404).json({
        error: new Error("Objet non trouvé !"),
      });
    }
    API_key.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "Objet supprimé !" }))
      .catch((error) => res.status(400).json({ error }));
  });
};
