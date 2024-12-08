import styles from '../styles/playercard.module.css';

export default function PlayerCard({name,score,active,self}) {
    return (
        <div className={(styles.playerCard)} style={{
            backgroundColor: self ? "#BCCCDC" : "white"
        }}>
            <div className={styles.playerName}>
                <span>{active ? "🖌️" : ""} </span>
                <span>{name}</span>

            </div>
            <div className={styles.playerScore}>
                {score}
            </div>
        </div>
    )

}