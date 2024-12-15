
import styles from '../styles/game.module.css';
import Canvas from '../components/Canvas';
import { useEffect, useRef, useState } from 'react';
import Lobby from '../components/lobby';
import Roundtras from '../components/roundtrans';
import { useLocation } from 'react-router-dom';
import {motion,animate} from 'motion/react';
import End from "../components/end"


import PlayerCard from '../components/playerCard';

function useQuery(){
    return new URLSearchParams(useLocation().search)
}

const CopyLink = (link) =>{
    navigator.clipboard.writeText(link).then(()=>{
        return true
    })
}
function Game() {
    const [gameEnd,setGameEnd] = useState(false)
    const query = useQuery();
    const name = query.get('name');
    const InviteLink = query.get('invite');
    const socket = useRef(null);
    const [socketState, setSocketState] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [activated, setActivated] = useState(false);
    const [wordchoices, setWordChoices] = useState([]);
    const [currentWord, setCurrentWord] = useState("");

    const [yourPlayer, setYourPlayer] = useState("");
    const [activePlayer, setActivePlayer] = useState("");

    const [Wordtimer,setWordTimer] = useState(null);
    const [turnTimer, setTurnTimer] = useState(null);

    const [turnInWay, setTurnInWay] = useState(false);

    const [roundScore, setRoundScore] = useState([]);

    const [copyErr, setCopyErr] = useState(false);
    
    
    
    useEffect(()=>{
        fetch('/api/ws').then((res) => {
            return res.json();
        }).then((data) => {
            const ws = new WebSocket(data.link + `/${name}`);
            console.log(data)
            ws.onopen = () => {
                console.log("connected")
                setSocketState(true)
                socket.current = ws;
            }

            
        const handleMessage =  (message) => {
            const data = JSON.parse(message.data);
            console.log(data)

            if (data.type === "your_name"){
                setYourPlayer(data.name)

            }


            if (data.type === "your_turn") {
                setTurnInWay(true)
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
                console.log(data.players)
              
                setParticipants(data.players)
            }

            if (data.type === "game_end"){
                setGameEnd(true)
                setParticipants(data.players)
            }


            if (data.type === "turn"){
                setTurnInWay(true)
                setActivePlayer(data.player)
            }

            if(data.type === "turn_timer_start"){
                setTurnTimer(data.timer)
            }

            if (data.type === "word_selected"){
                
                setCurrentWord(data.word)
                setActivated(true)
                setWordChoices([])
            }

            if(data.type === "current_word"){
            
                setCurrentWord(data.word)
            }

            if(data.type === "turn_ended"){
                const roundScore = data.roundScore
                console.log("round score")
                console.log(roundScore)
                setRoundScore(roundScore)
                
                console.log("turn ended")
                setTurnInWay(false)
                setActivated(false)
                setCurrentWord("")
                setActivePlayer("")
                setWordTimer(null)
                setTurnTimer(null)
            }


        }   

        ws.addEventListener('message', handleMessage);


          
        
        })

        return () =>{
            socket.current.close()
        }


        
        
      

        
    },[])

    


    const handleWordChoice = (word) => {
        console.log(word)
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

    useEffect(() => {
        if (turnTimer > 0) {
            const countdown = setInterval(() => {
                setTurnTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(countdown);
        } 

    },[turnTimer])

    const convert_sec = (sec) =>{
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes}:${seconds}`
    }

    return !gameEnd ? (

        <div className={styles.game}>
            {(gameStarted && !turnInWay) && <Roundtras scoring={roundScore}></Roundtras>}
          
            <div className={styles.header}>
                {turnTimer && <span className={styles.timer}>{convert_sec(turnTimer)}</span>}
                <span className={styles.word}>{currentWord ? currentWord : !gameStarted ? "Waiting for game start" : "Player is selecting word"}</span>
                
            </div>
            <div className={styles.body}>
                <div className={styles.participants}>
                    <h1 className={styles.playersTitle}>Plunderers</h1>
                    {participants.map((participant, index) => {
                        return <PlayerCard key={index} name={participant.name} score={participant.Score} active={activePlayer === participant.name} self={yourPlayer === participant.name} />
                    })}
                    {copyErr && <div className={styles.copyErr}>
                            <span>{copyErr}</span>
                        </div>}
                    <motion.div  whileHover = {{scale:1.2}} whileTap={{scale:0.9}} transition={{ type: "spring", stiffness: 400, damping: 10 }} className={styles.invite} style={{cursor:'pointer'}}>
                        
                        <span onClick={()=>
                        {
                            CopyLink(InviteLink)
                            setCopyErr("Copied")
                            setTimeout(()=>{
                                setCopyErr()
                            },3000)

                        }
                    }>Invite more +</span>
                        

                    </motion.div>

                </div>
                {(socketState && gameStarted  && turnInWay) && <Canvas ws={socket} activted={activated} />}
                
                {(!gameStarted && socketState && isHost) ? <Lobby ws={socket} />:

               (!gameStarted && <div className={styles.wait}>
                    <h1 styles={{
                        textAlign: "center",
                        fontSize: "2rem",
                        color: "white"
                    }}>Waiting for host to start game</h1>
                    
                </div>)}
               

            </div>
            {wordchoices.length > 0 && 
                <div className={styles.overlay}>  
                        <h2 className={styles.overlayHeading} style={{color:"#9AA6B2"}}> Your Turn</h2>   
                        <h3 className={styles.overlaySubheading} style={{color:"#BCCCDC"}}>Choose a word</h3>
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
    ): (<End players={participants} invite={InviteLink}/>)
}

export default Game;
