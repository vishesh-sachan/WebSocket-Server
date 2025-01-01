import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const app = express()
const httpServer = app.listen(8080)

const wss = new WebSocketServer({ server: httpServer });

enum Status {
  pending,
  approved,
  rejected,
  closed
}

interface Data {
  isStudent: Boolean,
  passId: number,
  studentId: number,
  status: Status
}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(message) {
    const data: Data = JSON.parse(message.toString());

    if (!data.isStudent) {
      // console.log(`from warden ${data.isStudent},${data.passId},${data.status},${data.studentId}`);
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                isStudent: data.isStudent,
                passId: data.passId,
                studentId: data.studentId,
                status: data.status
              }));
            }
          });
    }
    
    if (data.isStudent) {
      // console.log(`from student ${data}`);
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            isStudent: data.isStudent,
            passId: data.passId,
            studentId: data.studentId
          }));
        }
      });
    }
  });
});