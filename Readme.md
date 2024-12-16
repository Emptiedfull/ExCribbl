# ExCribbl

ExCribbl is a pirate themed multiplayer drawing game inspired by the popular game Skribbl.io. Players can join lobbies, take turns drawing, and guess the drawings to score points.

[Experience it now](http://37.27.51.34:36033/)

## Features

- Lobby Management
- Real-time drawing and guessing
- Score tracking
- customizable settings
- Inbuilt Load balancer and fault Handler

## Screenshots

### Lobby Screen
![Lobby Screen](https://cloud-i7tl01kng-hack-club-bot.vercel.app/0_ee561618-320c-490d-b16f-da1e4201ec0f_.png)

### Host Screen
![Host Screen](https://cloud-apee544fu-hack-club-bot.vercel.app/0_9eb11094-184a-45b5-a0e9-14b59318e795_.png)

### Drawing Screen
![Drawing Screen](
    https://cloud-f5ldmccwq-hack-club-bot.vercel.app/0_af4ac62a-3b2f-4bfd-a73d-e79241793169_.png
)

### End Screen
![End Screen](
    https://cloud-nf4mw7jjc-hack-club-bot.vercel.app/0_3377eeb8-295c-43f9-95dc-5601f8ab9f76_.png
)
## Getting Started

### Prerequisites

- Python 3.8+

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ExCribbl.git
    cd ExCribbl
    ```

2. Set up the Python environment:

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

3. Set up ports and host in [distro.py](http://_vscodecontentref_/1):

    Open [distro.py](http://_vscodecontentref_/2) and ensure the following lines are correctly set:

    ```python
    app_port = <Port>
    ```

    Ensure the `create_servers` function is called with the correct host and ports:

    ```python
    distro.create_servers("0.0.0.0",[port1,port2..])
    ```

    Setup invite link 
    
    ```python
    link = "http://<host>:" + str(<port>)
    
    redirectUrl = link+"?name="+name +"&invite="+"http://<host>:"+str(app_port)
    ```


### Running the Application

1. Run Distro.py:

    ```bash
    py distro.py
    ```


3. Open your browser and navigate to `http://localhost:<port>` to start playing.

### Systemd Service

To run the server as a systemd service, create a service file:

```service
[Unit]
Description="Scribbl Server"
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/<user>/ExCribbl
Environment="PATH=/home/<user>/ExCribbl/venv/bin:/usr/local/bin"
ExecStart=python3 distro.py

[Install]
WantedBy=default.target