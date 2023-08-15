import React, { useEffect , useState } from 'react';

import {Box} from '@mui/material';
import styled from '@emotion/styled';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const Component = styled.div`
    background: #F5F5F5;
`

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      
    [{ 'indent': '-1'}, { 'indent': '+1' }],          
    [{ 'direction': 'rtl' }],                         
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']                                         
];
  

function Editor()
{

    const [socket,setSocket] = useState();

    const [quill,setQuill] = useState();

    const { id } = useParams();

    useEffect(() => {
        const quillServer = new Quill('#container',{ theme: 'snow', modules: { toolbar: toolbarOptions} });
        quillServer.disable();
        quillServer.setText('Loading the document....');
        setQuill(quillServer);
    },[]);

    useEffect(() => { // This is done to establish a connection with backend
        const socketServer = io('http://localhost:9000');
        setSocket(socketServer);

        return () => { // If you use return statement in useEffect then it is equivalent to "ComponentWillUnmount"
            socketServer.disconnect();
        }
    },[]);

    useEffect(() => { // This useEffect will detect the changes in the text editor

        if(socket === null || quill === null) //Just in case any one of them is null
            return;

        const handleChange = (delta , oldData , source) => { //refer to quill-api doumentation for it

// delta contains the changes , oldData contains the old data and source contains the info about who made the changes
            if(source !== 'user')
                return;
            socket && socket.emit('send-changes',delta);// If socket if undefined then socket.emit will not work
        }

        quill && quill.on('text-change',handleChange);// If quill if undefined then quill.on will not work

            return () => {
                quill && quill.off('text-change',handleChange);// If quill if undefined then quill.off will not work
            }
    },[ quill , socket ]);

    useEffect(() => { 

        if(socket === null || quill === null) 
            return;

        const handleChange = (delta) => { 
            quill.updateContents(delta); 
//So here you have taken the changes from the socket and broadcasted to all the quills(multiuser sharing)
        }

        socket && socket.on('recieve-changes',handleChange);// If quill if undefined then quill.on will not work

            return () => {
                quill && quill.off('recieve-changes',handleChange);// If quill if undefined then quill.off will not work
            }
    },[ quill , socket ]);

    useEffect(() => {
        if(quill === null || socket === null)
            return;
        
        socket && socket.once('load-document',document => {
            quill && quill.setContents(document);
            quill && quill.enable();
        })

        socket && socket.emit('get-document',id);
    },[quill , socket , id]);

    useEffect(() => {
        if(socket === null || quill === null)
            return;
        
        const interval = setInterval(() => {
            socket && socket.emit('save-document',quill.getContents())
        },2000);

        return () => {
            clearInterval(interval);
        }

    },[socket,quill]);

    return(
        <Component>
            <Box className='container' id='container'></Box>
        </Component>
    );
}

export default Editor;