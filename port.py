import subprocess

command = [
    'nest',
    'get_port'
]
def get_port(n=3):
    
    ports = []
    for i in range(n):
        res = subprocess.run(command,capture_output=True,text=True)
        ports.append(int(res.stdout[5:10]))
    return ports


