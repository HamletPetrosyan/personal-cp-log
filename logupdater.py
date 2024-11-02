import json
import os
from datetime import datetime


## reading logdata.json and log.json

with open("logdata.json", mode="r", encoding="utf-8") as read_file:
    logdata = json.load(read_file)

print("Current Version:", logdata["version"])

with open(f"log{logdata['version']}.json", mode="r", encoding="utf-8") as read_file:
    log = json.load(read_file)

todaydate = datetime.today().strftime('%Y-%m-%d')


## Log of a solved problem

name = input("Insert the problem name: ")
source = input("Insert the source: ")
platform = input("Insert the platform: ")
tags = input("Insert the tags (using commas): ").replace(' ', '').split(",")
difficulty = int(input("Insert the difficulty: "))
comment = input("Insert your comment: ")

if not todaydate in log:
    log[todaydate] = []

log[todaydate].append({
    "name": name,
    "source": source,
    "platform": platform,
    "tags": tags,
    "comment": comment,
    "difficulty": difficulty
})


## logdata.json and log.json update

os.remove(f"./log{logdata['version']}.json")

logdata["version"] = logdata["version"] + 1

with open("logdata.json", mode="w", encoding="utf-8") as write_file:
    json.dump(logdata, write_file)
    
with open(f"log{logdata['version']}.json", mode="w", encoding="utf-8") as write_file:
    json.dump(log, write_file)


## script.js update

with open("script.js", mode="r", encoding="utf-8") as read_file:
    js = read_file.readlines()

js[1] = f'fetch("https://raw.githubusercontent.com/HamletPetrosyan/personal-cp-log/refs/heads/master/log{logdata["version"]}.json")\n'

with open("script.js", mode="w", encoding="utf-8") as write_file:
    write_file.writelines(js)
