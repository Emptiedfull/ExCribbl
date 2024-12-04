from fastapi import FastAPI,WebSocket,BackgroundTasks,WebSocketDisconnect
from pydantic import BaseModel
import asyncio
from board import Board
import json,time
import tkinter as tk
import random


app = FastAPI()




class Player(BaseModel):
    name: str
    score: int
    socket: WebSocket

    class Config:
        arbitrary_types_allowed = True
  
class Game:
    def __init__(self,players:list[Player],rounds):
        self.instructions = []
        self.players:list[Player] = players
        self.rounds:int = rounds
        self.current_round:int = 0
        self.current_player:Player = None
        self.stop_event = asyncio.Event()
        self.currentword = ""
        self.wordlist = ["apple","banana","cherry","dog","cat","elephant","giraffe","horse","iguana","jaguar","kangaroo","lion","monkey","newt","octopus","penguin","quail","rabbit","snake","tiger","umbrella","vulture","whale","xray","yak","zebra"]
        
      
    async def broadcast(self,message):
        for player in self.players:
            await player.socket.send_text(message)

    async def ex_broadcast(self,message,sender):
        for player in self.players:
            if player != sender:
                await player.socket.send_text(message)

    async def stop_board_loop(self):
        self.stop_event.set()


    async def start_game(self):
        self.current_round = 0
        self.current_player = None
        self.instructions = []

        message = {
                "type":"game_start",
                "players":[{"name":player.name,"Score":player.score} for player in self.players]
            }
        print(message)
        await self.broadcast(json.dumps(message))
        
        await self.start_round()


    async def start_round(self):
        self.instructions = []
        self.current_round += 1
        message = {
            "type":"round",
            "round":self.current_round
        }
        messagejson = json.dumps(message)
      
        await self.broadcast(messagejson)
        await self.start_turn()


    def gen_word_choices(self):
        words = []
        for i in range(3):
            words.append(random.choice(self.wordlist))
        return words

        
    async def start_turn(self):
        if self.current_player == None:
            self.current_player = self.players[0]
        else:
            index = self.players.index(self.current_player)
            if index == len(self.players)-1:
                self.current_player = self.players[0]
            else:
                self.current_player = self.players[index+1]
            
        message = {
            "type":"turn",
            "player":self.current_player.name
        }
        messagejson = json.dumps(message)

        personalmessage = {
            "type":"your_turn",
            "words":self.gen_word_choices()

        }
        await self.current_player.socket.send_text(json.dumps(personalmessage))
        await self.broadcast(messagejson)

    async def draw(self,instructionsList,player):

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

   

        await self.broadcast(json.dumps(instructionsList))




class Lobby:
    def __init__(self):
        self.clients:list[Player] = []
        self.host = None
        self.game:Game = None
    
    async def connect(self,socket,name):
        await socket.accept()
        player = Player(name=name,score=0,socket=socket)
        self.clients.append(player)
        if len(self.clients) == 1:
            self.host = self.clients[0]

        if self.game:
            message = {
                "type":"draw",
                "instructions":self.game.instructions
            }
            await player.socket.send_text(json.dumps(message))
        return player

    async def disconnect(self,socket):
        for player in self.clients:
            if player.socket == socket:
                self.clients.remove(player)
                if self.host == player:
                    self.host = self.clients[0]
                break

    async def broadcast(self,message):
        for client in self.clients:
            await client.socket.send_text(message)

    async def start_game(self,settings,player):
        
        if self.host == player and not self.game:
            self.game = Game(players=self.clients,rounds=settings["rounds"])


         
            await self.game.start_game()
            


lobby = Lobby()
    


@app.websocket("/ws/{name}")
async def websocket_endpoint(websocket: WebSocket,name:str):

    try:
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
    

