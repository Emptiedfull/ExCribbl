import subprocess
from fastapi import FastAPI
import atexit
from time import sleep
from fastapi.responses import FileResponse

app = FastAPI()


class server():
    def __init__(self,host,port,name):

        self.name = name
        self.host = host
        self.port = str(port)
        self.link = "http://"+host+":"+ str(port)
        self.process = None
       

    def start(self):
        self.process  = subprocess.Popen(["uvicorn","main:app","--host",self.host,"--port",self.port],stdout=subprocess.PIPE,stderr=subprocess.PIPE)

    def end(self):
        self.process.terminate()


class Distro():
    def __init__(self):
        self.maxServers = 3
        self.readyServers = []
        self.servers = []

    def create_server(self,host,port,name):
        if len(self.servers) >= self.maxServers:
            return
        server1 = server(host,port,name)
        server1.start()
        self.servers.append(server1)
        self.readyServers.append(server1)

    def create_servers(self,host,ports):
        for port in ports:
            self.create_server(host,port,"server"+str(port))

    def kill_servers(self):
        for server in self.readyServers:
            server.end()

    def get_lobbies(self):
        print(self.servers)
        lobbies = [server.name for server in self.readyServers]
        return lobbies


@app.get("/")
async def index():
    return FileResponse('./lobby.html',status_code=200)

@app.get("/lobbies")
async def lobbies():
    return distro.get_lobbies()

    
distro = Distro()
distro.create_servers("0.0.0.0",[8000,8001])

atexit.register(distro.kill_servers)