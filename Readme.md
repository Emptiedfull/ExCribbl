# 🎨 ExCribbl

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/FastAPI-0.115.5-green.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18.3.1-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>

ExCribbl is a **pirate-themed multiplayer drawing game** inspired by the popular game Skribbl.io. Players can join lobbies, take turns drawing, and guess the drawings to score points in real-time collaborative gameplay.

🎮 **[Experience it now](http://37.27.51.34:36033/)**

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [📖 Screenshots](#-screenshots)
- [🔧 Configuration](#-configuration)
- [🐳 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [❓ Troubleshooting](#-troubleshooting)
- [📄 License](#-license)

## ✨ Features

- 🏴‍☠️ **Pirate-themed gameplay** with immersive design
- 🌐 **Real-time multiplayer** drawing and guessing
- 🎯 **Lobby management** with customizable settings
- 📊 **Score tracking** and leaderboards
- ⚡ **Built-in load balancer** and fault handler
- 🔄 **Auto-scaling** server instances
- 🎨 **Canvas drawing tools** with color selection
- 💬 **Real-time chat** during gameplay
- 📱 **Responsive design** for all devices
- 🔒 **WebSocket-based** real-time communication

## 🛠️ Technology Stack

### Backend
- **Python 3.8+** - Core runtime
- **FastAPI** - Modern web framework
- **WebSockets** - Real-time communication
- **Uvicorn** - ASGI server
- **NumPy** - Mathematical operations
- **Pydantic** - Data validation

### Frontend
- **React 18.3.1** - User interface
- **JavaScript/TypeScript** - Frontend logic
- **CSS3** - Styling and animations
- **WebSocket Client** - Real-time updates

### Infrastructure
- **Custom Load Balancer** - Distributes player connections
- **Auto-scaling** - Dynamic server instance management
- **Logging System** - Comprehensive error tracking

## 🏗️ Architecture

ExCribbl uses a distributed architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Load Balancer │    │  Game Servers   │
│                 │◄──►│    (distro.py)  │◄──►│  (main.py)      │
│   - Canvas      │    │                 │    │  - WebSocket    │
│   - Chat        │    │ - Port 8010     │    │  - Game Logic   │
│   - UI          │    │ - Health Check  │    │  - Player Mgmt  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+** installed on your system
- **Node.js 16+** (for frontend development)
- **Git** for version control

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Emptiedfull/ExCribbl.git
    cd ExCribbl
    ```

2. **Set up the Python environment:**

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Create required directories:**

    ```bash
    mkdir -p build/static
    mkdir -p logs
    ```

4. **Test the installation:**

    ```bash
    python test_installation.py
    ```

5. **Configure the application:**

    Open `distro.py` and adjust the configuration as needed:

    ```python
    # Default configuration in distro.py
    app_port = 8010  # Main load balancer port
    
    # Server instances (modify as needed)
    distro.create_servers("127.0.0.1", [8000, 8001, 8002])
    ```

### Running the Application

1. **Start the load balancer and game servers:**

    ```bash
    python distro.py
    ```

2. **Open your browser and navigate to:**

    ```
    http://localhost:8010
    ```

3. **Start playing!** Enter your name and join or create a lobby.

### Development Setup

For frontend development:

```bash
cd client2
npm install
npm start  # Runs on http://localhost:3000
```

For backend development with auto-reload:

```bash
uvicorn main:app --reload --port 8000
```

## 📖 Screenshots

### Lobby Screen
![Lobby Screen](https://cloud-i7tl01kng-hack-club-bot.vercel.app/0_ee561618-320c-490d-b16f-da1e4201ec0f_.png)

### Host Screen
![Host Screen](https://cloud-apee544fu-hack-club-bot.vercel.app/0_9eb11094-184a-45b5-a0e9-14b59318e795_.png)

### Drawing Screen
![Drawing Screen](https://cloud-f5ldmccwq-hack-club-bot.vercel.app/0_af4ac62a-3b2f-4bfd-a73d-e79241793169_.png)

### End Screen
![End Screen](https://cloud-nf4mw7jjc-hack-club-bot.vercel.app/0_3377eeb8-295c-43f9-95dc-5601f8ab9f76_.png)

## 🔧 Configuration

### Server Configuration

Modify `distro.py` to customize server settings:

```python
# Change the main port
app_port = 8010

# Add more game server instances
distro.create_servers("0.0.0.0", [8000, 8001, 8002, 8003])

# Configure host (for production)
distro.create_servers("0.0.0.0", [8000, 8001, 8002])
```

### Game Settings

Players can customize game settings in the lobby:
- **Number of rounds**
- **Round duration**
- **Word difficulty**
- **Player limits**

## 🐳 Deployment

### Production Deployment

1. **Update configuration for production:**

    ```python
    # In distro.py
    distro.create_servers("0.0.0.0", [8000, 8001, 8002])
    ```

2. **Build the React frontend:**

    ```bash
    cd client2
    npm run build
    cp -r build/* ../build/
    ```

3. **Run with systemd (Linux):**

    Create `/etc/systemd/system/excribbl.service`:

    ```ini
    [Unit]
    Description=ExCribbl Game Server
    After=network.target

    [Service]
    Type=simple
    User=your-username
    WorkingDirectory=/path/to/ExCribbl
    Environment="PATH=/path/to/ExCribbl/venv/bin"
    ExecStart=/path/to/ExCribbl/venv/bin/python distro.py
    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target
    ```

    Enable and start the service:

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable excribbl.service
    sudo systemctl start excribbl.service
    ```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8010

CMD ["python", "distro.py"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## ❓ Troubleshooting

### Common Issues

**Q: Server won't start**
- Check if ports 8000-8002 and 8010 are available
- Ensure Python virtual environment is activated
- Verify all dependencies are installed

**Q: Cannot connect to game**
- Check firewall settings
- Ensure the correct IP address is configured
- Verify WebSocket connections are allowed

**Q: Drawing doesn't sync**
- Check network connectivity
- Ensure WebSocket connection is stable
- Try refreshing the browser

### Getting Help

- 🐛 **Bug Reports:** Open an issue on GitHub
- 💡 **Feature Requests:** Create a feature request issue
- 💬 **Questions:** Start a discussion in the repository

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Made with ❤️ by the ExCribbl team</strong>
  <br>
  <a href="https://github.com/Emptiedfull/ExCribbl/issues">Report Bug</a>
  ·
  <a href="https://github.com/Emptiedfull/ExCribbl/issues">Request Feature</a>
</div>