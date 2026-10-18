import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=process.env.PORT||process.env.SERVER_PORT||3000;
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.wav':'audio/wav','.mp3':'audio/mpeg'};
export function resolvePublicPath(raw){
 let decoded;try{decoded=decodeURIComponent(raw.split('?')[0])}catch{return {status:400}};
 const parts=decoded.split('/');
 if(!decoded.startsWith('/')||decoded.includes('\\')||decoded.includes('\0')||parts.some(p=>p==='..'||p.startsWith('.')))return {status:404};
 if(parts.some(p=>['scripts','tests','node_modules'].includes(p))||['/server.js','/package.json','/package-lock.json','/README.md'].includes(decoded))return {status:404};
 let filename=path.resolve(ROOT,'.'+(decoded==='/'?'/index.html':decoded));
 if(!filename.startsWith(ROOT+path.sep))return {status:404};
 if(fs.existsSync(filename)&&fs.statSync(filename).isDirectory())filename=path.join(filename,'index.html');
 if(!fs.existsSync(filename)&&!path.extname(filename)&&fs.existsSync(filename+'.html'))filename+='.html';
 if(!fs.existsSync(filename)||!fs.statSync(filename).isFile())return {status:404};
 return {status:200,filename};
}
export function createServer(){return http.createServer((req,res)=>{
 const headers={'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache, must-revalidate'};
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end('Method not allowed');return}
 if(req.url.split('?')[0]==='/health'){res.writeHead(200,{...headers,'Content-Type':'application/json'});res.end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok'}));return}
 const route=resolvePublicPath(req.url);const filename=route.filename||path.join(ROOT,'404.html');
 if(route.status===400){res.writeHead(400,headers);res.end('Invalid request');return}
 const ext=path.extname(filename);headers['Content-Type']=TYPES[ext]||'application/octet-stream';
 const compressed=req.method!=='HEAD'&&/\bgzip\b/.test(req.headers['accept-encoding']||'')&&/^(text\/|application\/(javascript|json|xml)|image\/svg)/.test(headers['Content-Type']);
 headers.Vary='Accept-Encoding';if(compressed)headers['Content-Encoding']='gzip';
 res.writeHead(route.status,headers);if(req.method==='HEAD'){res.end();return}
 const stream=fs.createReadStream(filename);stream.on('error',()=>res.destroy());if(compressed)stream.pipe(zlib.createGzip()).pipe(res);else stream.pipe(res);
})}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createServer();const target=Number.isNaN(Number(PORT))?PORT:Number(PORT);server.listen(target,()=>console.log('Free AI Harbor server ready'));
 for(const event of ['SIGTERM','SIGINT'])process.on(event,()=>server.close(()=>process.exit(0)));
}
