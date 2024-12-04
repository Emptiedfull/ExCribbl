import numpy as np
from typing import Tuple, Optional, List
import json


class Board():
    def __init__(self,x,y):
        self.shape = (x,y)
        self.x = x
        self.y = y
        self.board = np.zeros((x, y), dtype=[("Red", "i2"), ("Green", "i2"), ("Blue", "i2")])

    def __setitem__(self, key, value):
        self.board[key] = value

    def __getitem__(self, key):
      
        return self.board[key]
    
    def __str__(self):
        return str(self.board)
    
    def getJson(self):
        return json.dumps(self.board.tolist())
    
    def draw(self,colour,position):
        self.board[position] = colour

    def drawFilledCircle(self,colour,position,radius):
        position = tuple(position)
        radius = int(radius)
        colour = tuple(colour)
        
        for i in range(-radius,radius):
            for j in range(-radius,radius):
                if i**2 + j**2 <= radius**2:
                    if position[0]+i >= 0 and position[0]+i < self.x and position[1]+j >= 0 and position[1]+j < self.y:
                        self.board[position[0]+i,position[1]+j] = colour   
        
    def drawHollowCircle(self,colour,position,radius,thickness=1):
        for i in range(-radius,radius):
            for j in range(-radius,radius):
                if i**2 + j**2 <= radius**2:
                    if position[0]+i >= 0 and position[0]+i < self.x and position[1]+j >= 0 and position[1]+j < self.y:
                        if i**2 + j**2 >= (radius-thickness)**2:
                            self.board[position[0]+i,position[1]+j] = colour

    def drawLine(self,colour,start,end):
        x1,y1 = start
        x2,y2 = end
        dx = abs(x2-x1)
        dy = abs(y2-y1)
        if x1 < x2:
            sx = 1
        else:
            sx = -1
        if y1 < y2:
            sy = 1
        else:
            sy = -1
        err = dx-dy
        while True:
            self.board[x1,y1] = colour
            if x1 == x2 and y1 == y2:
                break
            e2 = 2*err
            if e2 > -dy:
                err = err - dy
                x1 = x1 + sx
            if e2 < dx:
                err = err + dx
                y1 = y1 + sy

    def drawRectangle(self,colour,start,end):
        x1,y1 = start
        x2,y2 = end
        for i in range(x1,x2):
            for j in range(y1,y2):
                self.board[i,j] = colour


    def draw(self,drawArray:list):
        print("Drawing array")

        try:
            for instruct in drawArray:
                print(instruct)
                shape = instruct["shape"].lower()
                if shape == "circle":
                    print("printing circle")
                    if instruct["filled"]:
                        self.drawFilledCircle(instruct["color"],instruct["center"],instruct["radius"])
                    else:
                        self.drawHollowCircle(instruct["colour"],instruct["position"],instruct["radius"],instruct["thickness"])
                elif shape == "line":
                    self.drawLine(instruct["colour"],instruct["start"],instruct["end"])
                elif shape == "rectangle":
                    self.drawRectangle(instruct["colour"],instruct["start"],instruct["end"])
                else:
                    print("Invalid shape")
        except Exception as e:
            print(e)
            print("Invalid draw array")
            
            

    def clear(self):
        self.board = np.zeros((self.x, self.y), dtype=[("Red", "i2"), ("Green", "i2"), ("Blue", "i2")])

    def get_image(self):
        image = np.zeros((self.x, self.y, 3), dtype=np.uint8)
        for i in range(self.x):
            for j in range(self.y):
                image[i, j] = [self.board[i, j]["Red"], self.board[i, j]["Green"], self.board[i, j]["Blue"]]
        return image
    
   







