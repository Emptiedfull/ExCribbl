
import styles from '../styles/canvas.module.css';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { UpdateCanvas, createCanvas, DrawCanvas, InstructionAdder } from './CanvasHandler';
import {CirclePicker,SketchPicker }from 'react-color'

import Message from './message';



function Canvas({ws,activted}) {
    const canvasRef = useRef(null);

    const [messages,setmessages] = useState([{author:"server",message:"welcome to the game"},{author:"server",message:"you have 60 seconds to draw"}]);
    const [guess,setguess] = useState("");

   
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const [controls, setControls] = useState({
        brushSize: 5,
        color: [60, 255, 100],
        shape: 'circle'
    });






    useEffect(() => {
        createCanvas(canvasRef)
    }, [])

    useEffect(() => {
            const socket = ws.current;

            const handleSocket = (event) => {
                let parsed = JSON.parse(event.data);
                if (parsed.type === "draw") {
                  
                    InstructionAdder(parsed.instructions, canvasRef);

                }

                if (parsed.type === "message") {
                    setmessages(messages => [...messages, { author: parsed.author, message: parsed.message }]);
                }

                if (parsed.type === "correct_guess"){
                    setmessages(messages => [...messages, { author: "server", message: `${parsed.player} has guessed the word` }]);

                }
            }
            socket.addEventListener('message', handleSocket);


            
            
        

        return () => {
            socket.removeEventListener('message', handleSocket);
        }

    }, []);

    useEffect(() => {
        if (!activted) return;
        const canvas = canvasRef.current;

        const getCursorPosition = (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            return { x, y };
        }

        const handleMouseDown = (event) => {
            setIsDragging(true);
            DrawCanvas(canvasRef, controls, getCursorPosition(event), ws.current);

        };

        const handleMouseMove = (event) => {
            const { x, y } = getCursorPosition(event);

            setControls((prevControls) => ({
                ...prevControls,
                cursorX: event.clientX,
                cursorY: event.clientY
            }));
            if (isDragging) {
                DrawCanvas(canvasRef, controls, getCursorPosition(event), ws.current);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
        }

        const handleMouseEnter = () => {
            setIsHovering(true);
        }



        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('mouseenter', handleMouseEnter);
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging,activted])

    const handleSliderChange = (event) => {
        setControls({
            ...controls,
            brushSize: event.target.value


        });

    };

    const handleGuess = () => {
        const message = {
            type: "guess",
            guess: guess
        }
        ws.current.send(JSON.stringify(message))
        setguess("");
    }





    return (
        <div className={styles.Canvas}>
            <div className={styles.column}>
                <div className={styles.board}>
                    <canvas
                        ref={canvasRef}
                        className={styles.boardInner}
                        style={{
                            cursor: {activted} ? 'default' : 'none'
                        }}

                    ></canvas>
                </div>
                {isHovering && activted && <div
                    className={styles.customCursor}
                    style={{
                        width: `${controls.brushSize * 2}px`,
                        height: `${controls.brushSize * 2}px`,

                        borderRadius: '50%',
                        backgroundColor: `rgb(${controls.color[0]},${controls.color[1]},${controls.color[2]})`,
                        position: 'absolute',
                        pointerEvents: 'none',
                        transform: `translate(-50%, -50%)`,
                        left: `${controls.cursorX}px`,
                        top: `${controls.cursorY}px`
                    }}
                ></div>}
                <div className={styles.controls}>
                    <input
                        type="range"
                        min="5"
                        max="20"
                        value={controls.brushSize}
                        onChange={(e) => handleSliderChange(e)}
                        style={{
                            '--thumb-size': `${controls.brushSize * 2}px`
                        }}
                    >
                    </input>
                    <CirclePicker
                        className={styles.colorPicker}
                        colors={
                            ['#000000', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF','#ffffff']
                        }
                        onChangeComplete={(color) => setControls({ ...controls, color: [color.rgb.r, color.rgb.g, color.rgb.b] })}/>

                </div>
            </div>
            <div className={styles.chat}>
                <div className={styles.chatMessages}>
                    {
                        messages.map((message, index) => {
                            return <Message key={index} author={message.author} message={message.message} />
                        })
                    }


                </div>
                <div classN ame={styles.chatInput}>
                    <input type="text" placeholder="guess the word" className={styles.chatTextInput} value={guess} onChange={(e)=>{setguess(e.target.value)}}/>
                    <button className={styles.chatSendButton}  onClick={()=>handleGuess()}>Send</button>

                </div>

            </div>


        </div>
    );
}

export default Canvas;