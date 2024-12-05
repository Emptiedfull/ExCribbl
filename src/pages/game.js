
import styles from '../styles/game.module.css';
import Canvas from '../components/Canvas';
import { useEffect, useRef, useState } from 'react';
import Lobby from '../components/lobby';

import PlayerCard from '../components/playerCard';
function Game() {
    const socket = useRef(null);
    const [socketState, setSocketState] = useState(false);
    const [isHost, setIsHost] = useState(false);

    const [gameStarted, setGameStarted] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [activated, setActivated] = useState(false);
    const [wordchoices, setWordChoices] = useState([]);
    const [currentWord, setCurrentWord] = useState("");
    const [activePlayer, setActivePlayer] = useState("");


    useEffect(() => {

        const ws = new WebSocket('ws://localhost:8000/ws/name');

        ws.onopen = () => {
            setSocketState(true)
            socket.current = ws;
        }

        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log(data)
            if (data.type === "game_start") {
                setGameStarted(true)
            }

            if (data.type === "host") {
                setIsHost(true)
            }

            if (data.type === "participants") {
                console.log(data.players)
                setParticipants(data.players)
            }

            if (data.type === "your_turn") {
                setWordChoices(data.words)
            }

            if (data.type === "turn"){
                setActivePlayer(data.player)
            }
        }



        return () => {
            ws.close();

        }

    }, []);

    const handleWordChoice = (word) => {
        socket.current.send(JSON.stringify({ type: "word_choice", word: word }))
        setWordChoices([])
        setActivated(true)
        setCurrentWord(word)
    }

    return (

        <div className={styles.game}>
            <div className={styles.header}>
                <span className={styles.timer}>1:02</span>
                <span className={styles.word}>{currentWord}</span>
            </div>
            <div className={styles.body}>
                <div className={styles.participants}>
                    {participants.map((participant, index) => {
                        return <PlayerCard key={index} name={participant.name} score={participant.Score} active={activePlayer === participant.name} />
                    })}

                </div>
                {(socketState && gameStarted) && <Canvas ws={socket} activted={activated} />}
                {(!gameStarted && socketState && isHost) && <Lobby ws={socket} />}
               

            </div>
            {wordchoices.length > 0 && 
                <div className={styles.overlay}>
                   
                        
                        {
                            wordchoices.map((word, index) => {
                                return <div key={index} className={styles.wordchoice} onClick={(e)=>{
                                    handleWordChoice(word)
                                }}>{word}</div>
                            })
                        }
                 

                </div>}

        </div>
    );
}

export default Game;
