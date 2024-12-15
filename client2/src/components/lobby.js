import { useState } from 'react';
import styles from '../styles/lobby.module.css';
import {motion,animate} from "motion/react";

export default function Lobby({ws}){
    const [rounds,setRounds] = useState(2)
    const [roundTime,setRoundTime] = useState(60)
    const [waitTime,setWaitTime] = useState(5)
    const [Err,setErr] = useState(false) 
    
    const handleRoundsChange = (e) => {
        setRounds(e.target.value)
    }

    const handleStart = ()=>{
        console.log("game start")
        const message = {
            type: "start_game",
            settings:{
                rounds: rounds,
                round_time: roundTime,
                wait_time: waitTime
            }

        }
        ws.current.send(JSON.stringify(message))

        setTimeout(()=>{
            console.log("waiting for response")
            setErr(true)
        },1000)

    }
    
    return (
        <div className={styles.lobby}>
            <div className={styles.wrapper}>
            <div className={styles.settings}>
                <label htmlFor="rounds">Number of Rounds:</label>
                <motion.select id="rounds" value={rounds} onChange={handleRoundsChange} whileHover={{scale:1.05}} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
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
                </motion.select>
                <label htmlFor="roundTime">Round Time:</label>
                <motion.select whileHover = {{scale:1.05}} transition={{ type: "spring", stiffness: 400, damping: 10 }} id="roundTime" value={roundTime} onChange={(e)=>setRoundTime(e.target.value)}>
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                    <option value="120">120</option>
                    <option value="150">150</option>
                    <option value="180">180</option>
                </motion.select>
                <label htmlFor="Wait Time">Wait Time:</label>
                <motion.select  whileHover = {{scale:1.05}} transition={{ type: "spring", stiffness: 400, damping: 10 }} id="Wait Time" value={roundTime} onChange={(e)=>setRoundTime(e.target.value)}>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </motion.select>

            </div>
            <div className={styles.buttons}>
                {Err && <p className={styles.error}>Error: Not enough players</p>}
                <motion.button whileHover={{scale:1.1}} transition={{ type: "spring", stiffness: 400, damping: 10 }} className={styles.start} onClick={(e)=>handleStart(e)}>
                    Start Game
                </motion.button>
            </div>
            </div>
        </div>
    )
}