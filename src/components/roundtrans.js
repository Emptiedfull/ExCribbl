import styles from "../styles/roundtrans.module.css"
import {useEffect, useState} from "react"


export default function Roundtras({scoring}){

    const [scores, setScores] = useState([])

    const parseScore = () =>{
        console.log(scoring)
        const temp = {}

        for (let i = 0; i < scoring.length; i++){
            let player = scoring[i].player
            let score = scoring[i].score
            temp[player]= score
        }

        setScores(temp)
        console.log(scores)
      
    }

    useEffect(() => {
        parseScore()
    }, [scoring])



    


    return(
        <div className={styles.main}>
            <h1 className={styles.title}>
                Turn over
            </h1>
            <div className={styles.scores}>
                {
                    Object.keys(scores).map((key,index) => {
                        return <div key={index} className={styles.score}>
                            <span className={styles.player}>{key}:</span>
                            <span className={styles.scorenum}>{scores[key]}</span>
                        </div>
                    })
                }
                
            </div>

        </div>
    )
}