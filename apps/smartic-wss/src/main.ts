import express from 'express';

import type { ChatMessage } from "@smartic/types";

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

const a: ChatMessage = {
  body: "hello",
  id: "sda",
  type: "chat-message",
  user: {
    color: "asd",
    id: "sdasda",
    isGuessing: false,
    points: 1,
    username: "scape"
  }
}

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
