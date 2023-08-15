import { Server } from 'socket.io';
import Connection from './database/db.js';

import { getDocument , updateDocument } from './controller/document-controller.js';

const PORT = 9000;

Connection();

const io = new Server(PORT,{ 
    cors:{   // There will be a cross origin error hence to by pass it we have made this cors object
        origin: 'http://localhost:3000', 
        methods: ['GET' , 'POST'] //Methods you want to allow
    }
});

io.on('connection', socket => { // In this we pass two arguments the first being the connection name

    socket.on('get-document', async documentId => {
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document',document.data);

        socket.on('send-changes',delta => { 
        // This is done to recieve the delta which was sent by the client(see 3rd useEffect of Editor.jsx)
                socket.broadcast.to(documentId).emit('recieve-changes',delta);
        })

        socket.on('save-document', async data => {
            await updateDocument(documentId,data);
        })
    })
}); 