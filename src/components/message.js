import styles from '../styles/message.module.css';

export default function Message({ message,author }){
    return (
        <div style={{
            fontSize: "0.8rem",
            padding: "0.2rem",
            margin: "0.2rem",
            backgroundColor: author === "server" ? "lightblue" : "lightgreen"
        }}>
            <p>{author}: {message}</p>
        </div>
    )

}