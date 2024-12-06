
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
    const [Wordtimer,setWordTimer] = useState(null);


    useEffect(() => {

        const ws = new WebSocket('ws://localhost:8000/ws/name');

        ws.onopen = () => {
            setSocketState(true)
            socket.current = ws;
        }

        const handleMessage =  (message) => {
            const data = JSON.parse(message.data);


            if (data.type === "your_turn") {
              
                setWordChoices(data.words)
                setWordTimer(30)
            }
            if (data.type === "game_start") {
                setGameStarted(true)
            }

            if (data.type === "host") {
                setIsHost(true)
            }

            if (data.type === "participants") {
              
                setParticipants(data.players)
            }


            if (data.type === "turn"){
                setActivePlayer(data.player)
            }

            if (data.type === "word_selected"){
                
                setCurrentWord(data.word)
                setActivated(true)
                setWordChoices([])
            }


        }   

        ws.addEventListener('message', handleMessage);



        return () => {
            ws.removeEventListener('message', handleMessage);
            ws.close();

        }

    }, []);

    const handleWordChoice = (word) => {
        socket.current.send(JSON.stringify({ type: "word_choice", word: word }))
        
       
    }

    useEffect(() => {
        if (Wordtimer > 0) {
            const countdown = setInterval(() => {
                setWordTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(countdown);
        } 
    }, [Wordtimer]);

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
                        <h2 className={styles.overlayHeading}> Your Turn</h2>   
                        <h3 className={styles.overlaySubheading}>Choose a word</h3>
                        <h3 className={styles.TimeRemaining}>Time Remaining: {Wordtimer}</h3>
                        <div className={styles.choices}>
                        {
                            wordchoices.map((word, index) => {
                                return <div key={index} className={styles.wordchoice} onClick={(e)=>{
                                    handleWordChoice(word)
                                }}>{word}</div>
                            })
                        }
                 
                            </div>
                      

                </div>}

        </div>
    );
}

export default Game;
