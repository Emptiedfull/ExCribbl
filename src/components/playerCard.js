import styles from '../styles/playercard.module.css';

export default function PlayerCard({name,score,active}) {
    return (
        <div className={(styles.playerCard) + " " +  (active ? styles.active: "none")} >
            <div className={styles.playerName}>
                {name}
            </div>
            <div className={styles.playerScore}>
                {score}
            </div>
        </div>
    )

}