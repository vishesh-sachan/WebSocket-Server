import axios from 'axios';
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
  isWarden:Boolean,
  isStudent:Boolean,
  passId:Number,
  status:Status
}

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
  
    ws.on('message', function message(message) {
      const data: Data = JSON.parse(message.toString());
      
      if (data.isWarden) {
        // Simulating an API response
        const res = { status: 200 };
        
        if (res.status === 200) {
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                isWarden: data.isWarden,
                isStudent: data.isStudent,
                passId: data.passId,
                status: data.status
              }));
            }
          });
        }
      }
  
      if (data.isStudent) {
        // Simulating a DB check for the pass
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              isWarden: data.isWarden,
              isStudent: data.isStudent,
              passId: data.passId,
              status: data.status
            }));
          }
        });
      }
    });
  });