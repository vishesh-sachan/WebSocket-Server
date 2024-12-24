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

interface data {
  isWarden:Boolean,
  isStudent:Boolean,
  passId:Number,
  status:Status
}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(message) {
    const data: data = JSON.parse(message.toString());
    // console.log(data)
    if(data.isWarden == true){
      const res:any = axios.put('http://localhost:3000/api/pass',{
        passId: data.passId,
        status: data.status
      })
      
      if(res.status == 200){
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            // console.log(`isWarden:${data.isWarden},isStudent:${data.isStudent},passId:${data.passId},status:${data.status}`)
            client.send(JSON.stringify({isWarden:data.isWarden,isStudent:data.isStudent,passId:data.passId,status:data.status}));
          }
        });
      }
    
    }

    if(data.isStudent == true){
      // make a db check for pass
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          // console.log(`isWarden:${data.isWarden},isStudent:${data.isStudent},passId:${data.passId},status:${data.status}`)
          client.send(JSON.stringify({isWarden:data.isWarden,isStudent:data.isStudent,passId:data.passId,status:data.status}));
        }
      });
    }
  });
});