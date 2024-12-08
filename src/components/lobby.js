import { useState } from 'react';
import styles from '../styles/lobby.module.css';

export default function Lobby({ws}){
    const [rounds,setRounds] = useState(2)
    const [roundTime,setRoundTime] = useState(60)
    
    const handleRoundsChange = (e) => {
        setRounds(e.target.value)
    }

    const handleStart = ()=>{
        console.log("game start")
        const message = {
            type: "start_game",
            settings:{
                rounds: rounds,
                round_time: roundTime
            }

        }
        ws.current.send(JSON.stringify(message))

    }
    
    return (
        <div className={styles.lobby}>
            <div className={styles.wrapper}>
            <div className={styles.settings}>
                <label htmlFor="rounds">Number of Rounds:</label>
                <select id="rounds" value={rounds} onChange={handleRoundsChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
                <label htmlFor="roundTime">Round Time:</label>
                <select id="roundTime" value={roundTime} onChange={(e)=>setRoundTime(e.target.value)}>
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                    <option value="120">120</option>
                    <option value="150">150</option>
                    <option value="180">180</option>
                </select>
            </div>
            <div className={styles.buttons}>
                <button className={styles.start} onClick={(e)=>handleStart(e)}>
                    Start Game
                </button>
            </div>
            </div>
        </div>
    )
}