const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

// Updated Token
const recipientToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiZW1haWwiOiJ0ZXN0dXNlcjJAZXhhbXBsZS5jb20iLCJyb2xlcyI6IlJPTEVfVVNFUiIsImlhdCI6MTc2NTc3MDUzMCwiZXhwIjoxNzY1NzcxNDMwfQ.GkFNEqJN-vztxGkdQsXojFSoOdCI_2SmJfoZunS6TZbrDN87nqHOsStD_RZ2J5UqU77CPTSCNqczmJSjSsWBLA";

const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    connectHeaders: {
        Authorization: `Bearer ${recipientToken}`
    },
    debug: function (str) {
        // console.log(str);
    },
    onConnect: function (frame) {
        console.log('Connected to WebSocket!');
        client.subscribe('/user/queue/messages', function (message) {
            console.log('Received Message: ' + message.body);
            client.deactivate();
            process.exit(0);
        });
        console.log('Subscribed to /user/queue/messages. Waiting for message...');
    },
    onStompError: function (frame) {
        console.log('Broker reported error: ' + frame.headers['message']);
        console.log('Additional details: ' + frame.body);
        process.exit(1);
    },
    onWebSocketClose: function() {
        console.log("WebSocket connection closed");
    }
});

client.activate();

// Timeout after 30 seconds
setTimeout(() => {
    console.log("Timeout waiting for message.");
    client.deactivate();
    process.exit(1);
}, 30000);
