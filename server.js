import {createServer} from './server-app.js';
// Hosting launchers may import this entry point instead of executing it directly.
// Always start here; tests import server-app.js without starting production.
const port=process.env.PORT||process.env.SERVER_PORT||3000;
const target=Number.isNaN(Number(port))?port:Number(port);
const server=createServer();
server.listen(target,()=>console.log('Free AI Harbor server ready'));
for(const event of ['SIGTERM','SIGINT'])process.on(event,()=>server.close(()=>process.exit(0)));
