const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const {
  encrypt,
  encryptWithPrivateKey,
  decrypt,
  decryptWithPublicKey,
} = require("./assymetric");
const { encryptSymmetric, decryptSymmetric } = require("./symmetric");
const { Inbox } = require("./inboxSchema");
const { User } = require("./userSchema");
const mongoose = require("mongoose");
const cors = require("cors");
const { stringify } = require("querystring");

mongoose
  .connect("mongodb://127.0.0.1:27017/Cryptography")
  .then(() => console.log("Connected"));

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbWork = async (primary, secondary, msg) => {
  const inbox = await Inbox.findOne({ $and: [{ primary }, { secondary }] });
  const inbox1 = await Inbox.findOne({
    $and: [{ primary: secondary }, { secondary: primary }],
  });
  if (!inbox) {
    const data = {
      primary,
      secondary,
      msgs: [{ ...msg, send: true }],
    };
    const inbox = new Inbox(data);
    const result = await inbox.save();
    console.log("Result", result);
  } else {
    const inbox = await Inbox.findOneAndUpdate(
      { $and: [{ primary }, { secondary }] },
      { $push: { msgs: { ...msg, send: true } } }
    );
    // const result = await inbox.save()
    console.log("new", inbox);
  }
  if (!inbox1) {
    const data = {
      primary: secondary,
      secondary: primary,
      msgs: [{ ...msg, recieved: true }],
    };
    const inbox = new Inbox(data);
    const result = await inbox.save();
    console.log("Result", result);
  } else {
    const inbox = await Inbox.findOneAndUpdate(
      { $and: [{ primary: secondary }, { secondary: primary }] },
      { $push: { msgs: { ...msg, recieved: true } } }
    );
    // const result = await inbox.save()
    console.log("new", inbox);
  }
};

app.post("/encrypt/assymmetric", async (req, res) => {
  const { type, secondary, primary, key } = req.body;
  let { text } = req.body;
  // console.log(type, text, secondary, primary, key);

  try {
    if (type == "private") {
      let pKey = key.split("\\n").join("\n").replaceAll(" ", "+");
      const nKey = crypto.createPrivateKey(
        "-----BEGIN PRIVATE KEY-----\n" + pKey + "\n-----END PRIVATE KEY-----\n"
      );
      text = encryptWithPrivateKey(text, nKey);
      console.log(text);
    }
    if (type == "public") {
      const pKey = crypto.createPublicKey(
        "-----BEGIN PUBLIC KEY-----\n" +
          key.split("\\n").join("\n") +
          "\n-----END PUBLIC KEY-----\n"
      );
      console.log(pKey);
      text = encrypt(text, pKey);
      console.log(text);
    }
    const msg = {
      text,
      keyType: type,
    };
    dbWork(primary, secondary, msg);

    res.send({ success: true });
  } catch (error) {
    res.status(400).send("Bad Request");
  }
});

app.post("/encrypt/symmetric", async (req, res) => {
  const { secondary, primary, key, keyType } = req.body;
  let { text } = req.body;

  try {
    const pkey = Buffer.from(key, "hex");
    text = encryptSymmetric(text, pkey);
    const msg = {
      text,
      keyType,
    };
    dbWork(primary, secondary, msg);

    res.send({ success: true });
  } catch (error) {
    res.status(400).send("Bad Request");
  }
});

app.get("/decrypt/symmetric", async (req, res) => {
  const { key } = req.query;
  let { text } = req.query;

  try {
    const pkey = Buffer.from(key, "hex");
    text = decryptSymmetric(text, pkey);
    console.log("text", text);
    res.send({ text });
  } catch (error) {
    res.status(400).send("Bad Request");
  }
});

app.get("/decrypt/assymmetric", async (req, res) => {
  const { key, keyType } = req.query;
  let { text } = req.query;
  try {
    if (keyType == "public") {
      let pKey = key.split("\\n").join("\n").replaceAll(" ", "+");
      const nKey = crypto.createPrivateKey(
        "-----BEGIN PRIVATE KEY-----\n" + pKey + "\n-----END PRIVATE KEY-----\n"
      );
      text = decrypt(text, nKey);
    } else {
      text = text.replaceAll(" ", "+");
      const pKey = crypto.createPublicKey(
        "-----BEGIN PUBLIC KEY-----\n" +
          key.split("\\n").join("\n") +
          "\n-----END PUBLIC KEY-----\n"
      );
      text = decryptWithPublicKey(text, pKey);
    }
    res.send({ text });
  } catch (error) {
    res.status(400).send("Bad Request");
  }
});

app.post("/user/:email", async (req, res) => {
  const { email } = req.params;
  const { dp } = req.query;
  const user = await User.findOne({ email });
  if (!user) {
    const user = new User({ email, dp });
    const result = await user.save();
    res.send(result);
  } else res.send(user);
});

app.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });
  if (user) res.send(user);
  else res.status(400).send("Bad Request");
});

app.get("/inbox/:email", async (req, res) => {
  const { email } = req.params;
  const inbox = await Inbox.find({ primary: email });
  if (inbox) {
    const resp = inbox.map(async (ib) => {
      const user = await User.findOne({ email: ib.secondary });
      return { email: user?.email, dp: user?.dp };
    });
    const result = await Promise.all(resp);
    console.log(result);
    res.send(result);
  } else res.send([]);
});

app.get("/inbox/:primary/:secondary", async (req, res) => {
  const { primary, secondary } = req.params;
  const inbox = await Inbox.findOne({ primary, secondary });
  if (inbox) {
    res.send(inbox.msgs);
  } else res.send([]);
});

app.listen(5000, () => console.log("Connected to port 5000000"));
