import styles from '../styles/playercard.module.css';
import {motion} from "framer-motion"
import {useState} from "react";


export default function PlayerCard({name,score,active,self}) {
    const [hovering,setHovering] = useState(false)


    

    return (
        <motion.div onHoverStart={()=>setHovering(true)} onHoverEnd={()=>setHovering(false)} whileHover={{scale:1.1}} transition={{type:"spring",stiffness:400}} className={(styles.playerCard)} style={{
            backgroundColor: self ? "#BCCCDC" : "white"
        }}>
            <div className={styles.playerName}>
                <span>{active ? "🖌️" : ""}</span>
                <span>{name}{self ? "(you)":""}</span>

            </div>
            <div className={styles.playerScore} style={{color: !hovering ? "black" : "green",fontWeight: !hovering ? "normal" : "bold"}}>
                {score}
            </div>
        </motion.div>
    )

}