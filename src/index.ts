import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const httpServer = app.listen(8080, () => {
  console.log('HTTP server listening on port 8080');
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

wss.on('connection', function connection(ws: WebSocket) {
  console.log('New WebSocket connection established');

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('message', function message(message: any) {
    console.log('Received message:', message.toString());

    let data: Data;
    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error('Error parsing message:', error);
      return;
    }

    console.log('Parsed data:', data);

    if (!data.isStudent) {
      console.log('Broadcasting to all non-student clients');
      wss.clients.forEach(function each(client: WebSocket) {
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
      console.log('Broadcasting to all student clients');
      wss.clients.forEach(function each(client: WebSocket) {
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