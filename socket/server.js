import {httpServer} from './index.js';

httpServer.listen(5000, ()=> {
    console.log("Server listening on port 5000");
})