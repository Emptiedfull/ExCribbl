
var instructionsList = []
var lastactivated = Date.now();

export const InstructionAdder = (instruction,canvasRef,ws = NaN) => {
    

    if (Array.isArray(instruction)) {
        instructionsList.push(...instruction);
    } else {
        instructionsList.push(instruction);
    }

    if (Date.now()-lastactivated>50){
        
        UpdateCanvas(canvasRef)

        if (ws) {
            console.log("sending")
            ws.send(JSON.stringify({ type: "draw", instructions: instructionsList }))
        }
        instructionsList = []
        lastactivated = Date.now()
    }



    
    // UpdateCanvas(canvasRef)
    // instructionsList = []
};


export const UpdateCanvas = (canvasRef) => {

    const orignalHeight = 600
    const originalWidth = 400

    const offscreenCanvas = document.createElement('canvas');
    let offscreenContext = offscreenCanvas.getContext('2d');

    const onscreenCanvas = canvasRef.current;
    const onscreenContext = onscreenCanvas.getContext('2d');

    offscreenCanvas.width = orignalHeight
    offscreenCanvas.height = originalWidth
   
    InstructionParser(instructionsList, offscreenContext)

    
    
    onscreenContext.drawImage(offscreenCanvas, 0, 0, onscreenCanvas.width, onscreenCanvas.height);

}




const InstructionParser = (instructions, canvasContext) => {
    
    instructions.forEach(instruction => {
        let color = instruction.color
        let thickness = instruction.thickness || 2
        switch (instruction.shape) {
            case 'rectangle':
                break;
            case 'circle':

                let center = instruction.center
                let radius = instruction.radius

                canvasContext.beginPath();
                canvasContext.arc(center[0], center[1], radius, 0, 2 * Math.PI)
                canvasContext.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`

                if (instruction.fill) {
                    canvasContext.fill();
                }
                else {
                    canvasContext.stroke();
                }
                canvasContext.closePath();


                break;
            case 'line':
                console.log(instruction)
                let start = instruction.start
                let end = instruction.end



                canvasContext.beginPath();
                canvasContext.moveTo(start[0], start[1]);
                canvasContext.lineTo(end[0], end[1]);
                canvasContext.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                canvasContext.lineWidth = thickness
                canvasContext.stroke();
                canvasContext.closePath();

                break
            default:
                console.log("Invalid shape")
                break
        }
    })
}


export const createCanvas = (canvasRef) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

};


export const DrawCanvas = (canvasRef, controls, position,ws) => {
    const canvas = canvasRef.current;
    const orignalHeight = 400
    const originalWidth = 600

    const canvasHeight = canvas.clientHeight
    const canvasWidth = canvas.clientWidth

   

    const multiplierX = canvasWidth / originalWidth
    const multiplierY = canvasHeight / orignalHeight

    var { x, y } = position
    x = x / multiplierX
    y = y / multiplierY
    let instruction = {}
    if (controls.shape === 'circle') {
        instruction = {
            shape: 'circle',
            center: [x,y],
            radius: controls.brushSize,
            color: controls.color,
            fill: true
        }
    }

    InstructionAdder(instruction,canvasRef,ws)
  
}