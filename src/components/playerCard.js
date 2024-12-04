import styles from '../styles/playercard.module.css';

export default function PlayerCard({name,score}) {
    return (
        <div className={styles.playerCard}>
            <div className={styles.playerName}>
                {name}
            </div>
            <div className={styles.playerScore}>
                {score}
            </div>
        </div>
    )

}