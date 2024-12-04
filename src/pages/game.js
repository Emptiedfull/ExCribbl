
import styles from '../styles/game.module.css';
import Canvas from '../components/Canvas';
import { useEffect,useRef, useState } from 'react';

function Game() {
  const socket = useRef(null);
  const [socketState, setSocketState] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  
  
  useEffect(() => {
        
        const ws = new WebSocket('ws://localhost:8000/ws/name');
        
        ws.onopen = () => {
            setSocketState(true)
            socket.current = ws;

            ws.send(JSON.stringify({
                type: "start_game",
                settings: {
                  "rounds": 3
                }
            }))
        }

        ws.onmessage = (message) =>{
            const data = JSON.parse(message.data);
            console.log(data)
            if (data.type === "game_start"){
                setGameStarted(true)
                const participants = data.players;
                console.log(participants)
            }

            if (data.type === "your_turn"){
                console.log("your turn")
            }
        }

        

        return () => {
            ws.close();

        }

    }, []);
  return (

    <div className={styles.game}>
        <div className={styles.header}>
            <span className={styles.timer}>1:02</span>
            <span className={styles.word}>__k__o</span>
        </div>
        <div className={styles.body}>
            <div className={styles.participants}>

            </div>
            {socketState && <Canvas ws={socket}/>}

        </div>
       
    </div>
  );
}

export default Game;
