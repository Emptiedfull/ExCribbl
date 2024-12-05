import { useState } from 'react';
import styles from '../styles/lobby.module.css';

export default function Lobby({ws}){
    const [rounds,setRounds] = useState(2)
    
    const handleRoundsChange = (e) => {
        setRounds(e.target.value)
    }

    const handleStart = ()=>{
        console.log("game start")
        const message = {
            type: "start_game",
            settings:{
                rounds: rounds
            }

        }
        ws.current.send(JSON.stringify(message))

    }
    
    return (
        <div className={styles.lobby}>
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
            </div>
            <div className={styles.buttons}>
                <button className={styles.start} onClick={(e)=>handleStart(e)}>
                    Start Game
                </button>
            </div>
        </div>
    )
}