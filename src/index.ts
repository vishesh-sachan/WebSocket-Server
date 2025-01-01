import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('WebSocket server is running!');
});

const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ server: httpServer });

enum Status {
  pending,
  approved,
  rejected,
  closed,
}

interface Data {
  isStudent: boolean;
  passId: number;
  studentId: number;
  status: Status;
}

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');
  ws.on('error', console.error);

  ws.on('message', (message: WebSocket.RawData) => {
    const data: Data = JSON.parse(message.toString());

    if (!data.isStudent) {
      wss.clients.forEach((client: WebSocket) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              isStudent: data.isStudent,
              passId: data.passId,
              studentId: data.studentId,
              status: data.status,
            })
          );
        }
      });
    }

    if (data.isStudent) {
      wss.clients.forEach((client: WebSocket) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              isStudent: data.isStudent,
              passId: data.passId,
              studentId: data.studentId,
            })
          );
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

wss.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});