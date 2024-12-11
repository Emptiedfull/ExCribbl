import csv
import random

def load_csv():
    with open("words.txt",mode="r",encoding="utf-8") as file:
        reader = csv.reader(file,delimiter=";")
        words = [row for row in reader][2]
    for i in range(len(words)):
        if words[i] == "":
            words.pop(i)
        else:
            words[i] = words[i].lower().strip()
    return list(set(list(words)))

def random_select(words):
    word = words[random.randint(0,len(words)-1)]   
    return word

def word_choices(words,n=3):
    choices = []
    for i in range(n):
        word = random_select(words)
        if word not in choices:
            choices.append(word)
    return choices

def gen():
    words = load_csv()
    return word_choices(words)
