import subprocess
from fastapi import FastAPI
import atexit
from time import sleep
from fastapi.responses import FileResponse,RedirectResponse
import requests
import json,asyncio
import string,random


app = FastAPI()


class server():
    def __init__(self,host,port,name):

        self.name = name
        self.host = host
        self.port = str(port)
        self.link = "http://"+host+":"+ str(port)
        self.status = None
        self.process = None
        self.clients = []
        self.forceOn = False
       

    def start(self):
        print("Starting server on port: "+self.port)
        with open(f'{self.port}server.log' , 'w') as logfile:
            self.process = subprocess.Popen(
                ["uvicorn", "main:app", "--host", self.host, "--port", self.port],
                stdout=logfile,
                stderr=logfile
            )

    def restart(self):
        self.end()
        self.forceOn = True
        self.start()

    async def timeout(self):
        await sleep(100000)
        self.forceOn = False


    def end(self):
        self.process.terminate()
        self.process.wait()


class Distro():
    def __init__(self):
        self.maxServers = 3
        self.activeServers = []
        self.inactiveServers = []
        self.servers = []

       

    async def create_server(self,host,port):
        if len(self.servers) >= self.maxServers:
            return
        name = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        server1 = server(host,port,name)
        server1.start()
        await self.wait_for_startup(server1)
        self.servers.append(server1)
        self.inactiveServers.append(server1)

        
    def create_servers(self,host,ports):
        for port in ports:
            asyncio.create_task(self.create_server(host,port))

    def kill_servers(self):
        for server in self.activeServers:
            server.end()

    def get_lobbies(self):
        print(self.activeServers)
        lobbies = [[server.name,len(server.clients)] for server in self.activeServers]
        return lobbies

    async def wait_for_startup(self,server):
        while True:
            
            await asyncio.sleep(1)
            try:
                url = server.link + "/status"
                status = requests.get(url)
                if status:
                    return True
            except:
                
                continue

        
    
    async def updateactiveServers(self):
        
        for server in self.servers:
           
            url = server.link + "/status"
            try:
                status = requests.get(url)
            except:
                continue
            print(status)
            status = json.loads(json.loads(status.text))
    
            # if status["game"] == "inactive": 
            #     if status.get("players"):
            #         print(status["players"])
            #         if len(status["players"]) == 0 and server in self.activeServers:
            #             print("Server is inactive")
            #             self.activeServers.remove(server)
            #             if server not in self.inactiveServers:
            #                 self.inactiveServers.append(server)
            #         if len(status["players"]) > 0:
            #             print("Server is active")
            #             server.clients = status["players"]
            #             self.activeServers.append(server)
            #             print(self.activeServers)
            #     else:
            #         if server in self.activeServers:
            #             self.activeServers.remove(server)  
            #         self.inactiveServers.append(server)
                
            # else:
            #     self.activeServers.append(server)

            if status["game"] == "activate":
                if server not in self.activeServers:
                    self.activeServers.append(server)
                    if server in self.inactiveServers:
                        self.inactiveServers.remove(server)
            if status["game"] == "inactive":
                print("Server is inactive")
                players = status.get("players")
                if server.forceOn:
                    if players:
                            server.clients = players
                    if server not in self.activeServers:
                        self.activeServers.append(server)
                        
                        if server in self.inactiveServers:
                            self.inactiveServers.remove(server)
                    continue      
                
                if players:
                    if len(players) == 0:
                       
                            if server in self.activeServers:
                                self.activeServers.remove(server)
                            if server not in self.inactiveServers:
                                self.inactiveServers.append(server)
                    if len(players) > 0:
                        if server not in self.activeServers:
                            self.activeServers.append(server)
                            if server in self.inactiveServers:
                                self.inactiveServers.remove(server)
                        server.clients = players
                else:
                    if server in self.activeServers:
                        self.activeServers.remove(server)
                    if server not in self.inactiveServers:
                        self.inactiveServers.append(server)


    
    def activate_server(self):
        if self.inactiveServers:
            server = self.inactiveServers.pop()
            server.restart()
            self.activeServers.append(server)
        else:
            print("No inactive servers")

    def get_lobby_link(self,name):
        for server in self.activeServers:
            if server.name == name:
                return server.link
        return None


@app.get("/")
async def index():
    return FileResponse('./lobby.html',status_code=200)

@app.get("/lobbies")
async def lobbies():
    await distro.updateactiveServers()
    return distro.get_lobbies()

@app.get('/lobby/{code}/{name}')
async def lobby(code,name):
    link = distro.get_lobby_link(code)
    if link == None:
        return "Lobby not found"
    
    redirectUrl = link+"?name="+name

    return RedirectResponse(redirectUrl)





@app.get("/create")
async def lobby():
    distro.activate_server()
    return "Creating lobby"

    
distro = Distro()
distro.create_servers("127.0.0.1",[8000,8001,8002])



atexit.register(distro.kill_servers)