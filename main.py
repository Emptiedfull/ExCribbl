from fastapi import FastAPI,WebSocket,WebSocketDisconnect,Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
import asyncio
from fastapi.staticfiles import StaticFiles
import json,time
from multiprocessing import Manager
import random
from distance import distance
from wordselect import gen


app = FastAPI()
app.mount('/static',StaticFiles(directory="build/static"),name="static")

class Player(BaseModel):
    name: str
    score: int
    socket: WebSocket

    class Config:
        arbitrary_types_allowed = True

class Settings(BaseModel):
    rounds:int
    round_time:int
  
class Game:
    def __init__(self,players:list[Player],settings:Settings,lobby):
        self.lobby = lobby
        self.instructions = []
        self.players:list[Player] = players
        self.players_left:list[Player] = players
        self.passed:list[Player] = []
        self.settings = settings
        self.roundScore:list[dict[Player,int]] = []
        self.current_round:int = 0
        self.current_player:Player = None
        self.stop_event = asyncio.Event()
        self.early_stop:bool = False
        self.autoSelect = None
        self.wordchoices = []
        self.currentword = ""
        self.wordlist = ["apple","banana","cherry","dog","cat","elephant","giraffe","horse","iguana","jaguar","kangaroo","lion","monkey","newt","octopus","penguin","quail","rabbit","snake","tiger","umbrella","vulture","whale","xray","yak","zebra"]
        self.revealed = ""
        self.auto_select_task = None
        self.auto_reveal_task = None    

    async def HandleDisconnet(self,player:Player):
        print("handling disconect:",player.name)

        self.players.remove(player)
       
        
        if len(self.players) == 0:
            return "end"
      
        if player == self.current_player:
            await self.turn_cleanup()
        message = {
            "type":"participants",
            "players":[{"name":player.name,"Score":player.score} for player in self.players]
        }
        await self.broadcast(json.dumps(message))
  
        
    
    async def guess(self,guess:str,player:Player):
        if player == self.current_player or player in self.passed:
            return
        if guess == self.currentword:
            self.roundScore.append({"player":player,"score":100 - len(self.passed)*10 - len(self.revealed)*5})
            self.players[self.players.index(player)].score += 100 - len(self.passed)*10 - len(self.revealed)*5
            message = {
                "type":"correct_guess",
                "player":player.name,
                
            }
            self.passed.append(player)

            await self.broadcast(json.dumps(message))
            if len(self.passed) == len(self.players) - 1:
                self.early_stop = True
                await self.turn_cleanup()
        else:
            print("Incorrect guess")

            message = {
                "type":"message",
                "author":player.name,
                "message":guess
            }

            if distance(guess,self.currentword) <=2:
                message2 = {
                    "type":"message",
                    "player":"server",
                    "message":"Close guess"
                }

                await player.socket.send_text(json.dumps(message2)) 
            
            await self.broadcast(json.dumps(message))

    async def reveal_letters(self):
        print( "Revealing letters")
        exempt = [" ","-","'"]
        message = {
            "type":"current_word",
            "word":"".join(["_" if char not in exempt else char for char in self.currentword])
        }

        message2 = {
            "type":"turn_timer_start",
            "timer":self.settings["round_time"]
        }
        
        await self.ex_broadcast(json.dumps(message),self.current_player)
        await self.broadcast(json.dumps(message2))
        time_start = time.time()
        while not self.early_stop:
            await asyncio.sleep(10)
            if time.time() - time_start > int(self.settings["round_time"]) or self.early_stop:
                break
            if len(self.revealed) != len(self.currentword)-2 and self.currentword:
                letter = random.choice(self.currentword)
            
                if letter not in self.revealed:
                    self.revealed += letter
                    word = list("".join(["_" if char not in exempt else char for char in self.currentword]))
                    for revealed in self.revealed:
                    
                        index = self.currentword.index(revealed)
                        word[index] = revealed
                    word = "".join(word)

                    message = {
                        "type":"current_word",
                        "word":word
                    }

                    await self.ex_broadcast(json.dumps(message),self.current_player)
        
        print("early stop: ",self.early_stop)

       

        if  not self.early_stop:
            print("Time up")
            await self.turn_cleanup()

       

        

    async def turn_cleanup(self):
        if self.auto_reveal_task:
            self.auto_reveal_task.cancel()
            try:
                await self.auto_reveal_task
            except asyncio.CancelledError:
                pass

        
        
        try:
            self.roundScore = [{"player":player["player"].name,"score":player["score"],"current":False} for player in self.roundScore]
            self.roundScore.append({"player":self.current_player.name,"score":0 + len(self.passed)*20 - len(self.revealed)*5,"current":True})
            self.players[self.players.index(self.current_player)].score += 0 + len(self.passed)*20 - len(self.revealed)*5
        except:
            pass

        try:
            
            self.auto_select_task.cancel()
            self.early_stop = False
        except:
            pass


        message = {
            "type":"turn_ended",
            "word":self.currentword,
            "roundScore":self.roundScore
        }

        await self.broadcast(json.dumps(message))

        message = {
            "type":"current_word",
            "word":""
        }
        

        message2 = {
            "type":"participants",
            "players":[{"name":player.name,"Score":player.score} for player in self.players]
        }

        await self.broadcast(json.dumps(message2))
        print("starting sleep")
        await asyncio.sleep(self.settings["wait_time"])
        print("ending sleep ")
        self.roundScore = []
        self.revealed = ""
        self.autoSelect = False
        self.currentword = ""
        self.instructions = []
        self.wordchoices = []
        self.passed = []
        await self.start_turn()
        

      
    async def broadcast(self,message):
        for player in self.players:
            await player.socket.send_text(message)

    async def ex_broadcast(self,message,sender):
        for player in self.players:
            if player != sender:
                await player.socket.send_text(message)




    async def start_game(self):
        self.current_round = 0
        self.current_player = None
        self.instructions = []

        message = {
                "type":"game_start",
                "players":[{"name":player.name,"Score":player.score} for player in self.players]
            }
        await self.broadcast(json.dumps(message))
        
        await self.start_round()


    async def start_round(self):
        self.players_left = self.players.copy()
        self.instructions = []
        self.current_round += 1
        if self.current_round > int(self.settings["rounds"]):
            message = {
                "type":"game_end",
                "players":[{"name":player.name,"Score":player.score} for player in self.players]
            }
            print("Game end")
           
            await self.broadcast(json.dumps(message))
            self.lobby.game = None
            self.lobby.clients = []
            await self.lobby.disconnect_all()
            return
        message = {
            "type":"round",
            "round":self.current_round,
            "rounddisp":f'{self.current_round}/{self.settings["rounds"]}'
        }
        messagejson = json.dumps(message)
      
        await self.broadcast(messagejson)
        await self.start_turn()


    
    async def auto_select_word(self):
        await asyncio.sleep(30)
        if self.autoSelect != False:
            print("Auto selectng word")
            self.currentword = random.choice(self.wordchoices)
            message = {
                "type":"word_selected",
                "word":self.currentword
            }
            await self.current_player.socket.send_text(json.dumps(message))
            self.auto_reveal_task = asyncio.create_task(self.reveal_letters())

    async def select_word(self,word,player):
        if player != self.current_player:
            return
        if word not in self.wordchoices:
            return
        self.autoSelect = False
        self.auto_select_task.cancel()

        self.currentword = word
        message = {
            "type":"word_selected",
            "word":word
        }
        await self.current_player.socket.send_text(json.dumps(message))
        self.auto_reveal_task = asyncio.create_task(self.reveal_letters())
        
    async def start_turn(self):
        print("Starting turn")
        if len(self.players_left) == 0:
            print("Round end")  
            await self.start_round()
            return
        self.current_player = self.players_left.pop()
        
            
        message = {
            "type":"turn",
            "player":self.current_player.name
        }
        messagejson = json.dumps(message)

        self.wordchoices = gen()
        personalmessage = {
            "type":"your_turn",
            "words":self.wordchoices

        }
       

        await self.current_player.socket.send_text(json.dumps(personalmessage))
        await self.broadcast(messagejson)

        self.autoSelect = True
        self.auto_select_task = asyncio.create_task(self.auto_select_word())


    async def draw(self,instructionsList,player):

        if player != self.current_player:
            return

        message = {
            "type":"draw",
            "instructions":instructionsList
        }
        if type(instructionsList) == list:
            for instruction in instructionsList:
                self.instructions.append(instruction)
        else:
            self.instructions.append(instructionsList)
        await self.ex_broadcast(json.dumps(message),player)

class Lobby:
    def __init__(self):
        self.clients:list[Player] = []
        self.host = None
        self.game:Game = None
    
    async def connect(self,socket,name):
      
        await socket.accept()

        for player in self.clients:
            if player.name == name:
                name = name + str(random.randint(0,100))
       
           
        player = Player(name=name,score=0,socket=socket)
        self.clients.append(player)
        print("Connected:",len(self.clients),self.host)
        if len(self.clients) == 1 and not self.host:
            print("Host set")
            self.host = self.clients[0]
            await self.host.socket.send_text(json.dumps({"type":"host"}))

        message1 = {
            "type":"participants",
            "players":[{"name":player.name,"Score":player.score} for player in self.clients]
        }

        await self.broadcast(json.dumps(message1))

        message2 = {
            "type":"your_name",
            "name":player.name
        }


        await player.socket.send_text(json.dumps(message2))

        if self.game:    
            await player.socket.send_text(json.dumps({"type":"game_start","players":[{"name":player.name,"Score":player.score} for player in self.game.players]}))
            await player.socket.send_text(json.dumps({"type":"round","round":self.game.current_round}))
            await player.socket.send_text(json.dumps({"type":"turn","player":self.game.current_player.name}))

          
            message = {
                "type":"draw",
                "instructions":self.game.instructions
            }
            await player.socket.send_text(json.dumps(message))
        return player

    async def disconnect(self,socket):
        for player in self.clients:
            if player.socket == socket:
                if self.game:
                    if await self.game.HandleDisconnet(player) == "end":
                        self.game = None
                else:
                    self.clients.remove(player)
                if self.host == player and len(self.clients) > 0:
                    self.host = self.clients[0]
                    await self.host.socket.send_text(json.dumps({"type":"host"}))
                break
        if len(self.clients) == 0:
            self.host = None
    

    async def broadcast(self,message):
        for client in self.clients:
            await client.socket.send_text(message)

    async def start_game(self,settings:Settings,player):
        
        if self.host == player and not self.game and len(self.clients) > 1:
            self.game = Game(self.clients,settings,self)
            await self.game.start_game()

    async def disconnect_all(self):
        for player in self.clients:
            await player.socket.close()
            


lobby = Lobby()



@app.websocket("/ws/{name}")
async def websocket_endpoint(websocket: WebSocket,name:str):


    try:
        print(websocket.client_state)
        if len(name) > 7:
            name = name[:8] + "..."
        player = await lobby.connect(websocket,name)
        while True:
           
            data = await websocket.receive_text()
            await EventHandlder(data,player)
    except WebSocketDisconnect:
        await lobby.disconnect(websocket)
        print("Disconnected")
    


        
async def EventHandlder(message:str,player:Player):
    try:
        data = json.loads(message)

        
    except:
        print("Invalid message format")
        await player.socket.send_text("Invalid message format")

        return

    if data["type"] == "start_game":
    
        await lobby.start_game(data["settings"],player)

    if data["type"] == "draw":
        await lobby.game.draw(data["instructions"],player)

    if data["type"] == "test":
        await lobby.game.test()

    if data["type"] == "word_choice":
        
        await lobby.game.select_word(data["word"],player)

    if data["type"] == "guess":
        
        await lobby.game.guess(data["guess"],player)
    

@app.get("/status")
async def status():
    statusMsg = {}
    if lobby.game:
        statusMsg["game"] = "active"
        playerList = []
        for player in lobby.game.players:
            playerList.append({"name":player.name,"score":player.score})
        statusMsg["players"] = playerList
    else:
        statusMsg["game"] = "inactive"
        if len(lobby.clients) > 0:
            clientList = []
            for client in lobby.clients:
                clientList.append(client.name)
            statusMsg["players"] = clientList
    return json.dumps(statusMsg)

@app.get("/api/ws")
async def get(request:Request):
    print(request.url.hostname)
    print(request.url.port)
    url = f"ws://{request.url.hostname}:{request.url.port}/ws"
    print(url)
    return {"status":"ok","link":url}

@app.get('/')
def index():
    return FileResponse("build/index.html")