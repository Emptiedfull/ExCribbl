import styles from "../styles/roundtrans.module.css"
import {useEffect, useState} from "react"


export default function Roundtras({scoring}){

   


    console.log("scoring",scoring)
    


    return(
        <div className={styles.main}>
            <h1 className={styles.title}>
                Turn over
            </h1>
            <div className={styles.scores}>
                {
                    scoring.map((obj,index) => {
                        return <div key={index} className={styles.score}>
                            <span className={styles.player}>{obj.player}:  </span>
                            <span className={styles.scorenum}>{obj.score}</span>
                            <span className={styles.active}>{obj.current ? "🖌️" : ""}</span>
                        </div>
                    })
                }
                
            </div>

        </div>
    )
}