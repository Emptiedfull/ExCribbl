import styles from "../styles/end.module.css"
import {motion} from "motion/react"

const End = ({players,invite})=>{

    
     
    const samplePlayers = [
        { name: "Alice", Score: 150 },
        { name: "Bob", Score: 200 },
        { name: "Charlie", Score: 100 },
        { name: "David", Score: 250 }
    ];

    const ScoreBlock = () =>{
        const sorted = samplePlayers.sort((a, b) => b.Score - a.Score);
    
        const res = sorted.map((entry,i)=>{
            let name = entry.name
            let score = entry.Score
            let pos = i+1

            const color_mapping = {
                1:"#FFD700",
                2:"#C0C0C0",
                3:"#966919 "
            }

            return (
                <motion.div animate={{opacity:1}} initial={{opacity:0}} whileHover={{scale:1.2}} transition={{opacity:{delay:0.2},scale:{type:"spring"}}} className={styles.scoreRow} style={{fontSize:1.4 + (sorted.length - pos + 1)*0.3+"rem",color:color_mapping[i+1]}}>
                    <span>
                        {pos}. {name} {pos === 1 ? "👑":""}
                    </span>
                    <span>
                        {score}
                    </span>

                </motion.div>
            )
            
        })
        return res

    }

    
    return(
        <motion.div className={styles.main} animate={{opacity:1}} initial={{opacity:0}}>
            <motion.div className={styles.heading}>
                <motion.h1 animate={{scale:[0.9,1.2]}}  transition={{type:"spring",bounce:1,mass:1.5,delay:0.2}}>
                    Game <span style={{color:"#FF6961"}}>Ended</span>
                </motion.h1>
                <p>
                    <span style={{color:"#6BADCE"}}>Ex</span>Cribbl
                </p>
            </motion.div>
            <div className={styles.scores}>
                {ScoreBlock()}
            </div>

            <div className={styles.invite}>
                

            </div>
        </motion.div>
    )
}

export default End 