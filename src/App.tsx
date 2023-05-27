import { useEffect, useRef } from 'react'
import { tracks } from './assets/index'


const colors = [
  '#fafa6e',
  '#c4ec74',
  '#92dc7e',
  '#64c987',
  '#39b48e',
  '#089f8f',
  '#00898a',
  '#08737f',
  '#215d6e',
  '#2a4858',
]

const keys = tracks.map(track => {
  const audio = new Audio(track)
  audio.volume = 0.15;
  return audio
})

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const startTime = Date.now();

    console.log("h")
    const audioTimes = colors.map((_, index) => {
      return calculateNextImpactTime(startTime, calculateVelocity(index))
    })

    /* const arcPadding = 16; */
    //            half line   - smallest arc   - 8px padding
    /* const arcs = (length * 0.5 - (length * 0.1) - 8) / arcPadding; */

    const draw = () => {
      canvas.width = canvas?.clientWidth;
      canvas.height = canvas?.clientHeight;

      ctx.lineWidth = 2;

      const width = canvas?.width;
      const height = canvas?.height;

      const start = { x: width * 0.1, y: height * 0.5 };
      const end = { x: width * 0.9, y: height * 0.5 };
      const center = { x: width * 0.5, y: height * 0.5 };

      const length = end.x - start.x;

      const arcs = colors.length;
      const arcPadding = (length * 0.5 - (length * 0.1)) / arcs;

      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = elapsed / 1000;
      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = '#334155';

      // Line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      for (let i = 0; i < arcs; i++) {
        /* ctx.fillStyle = '#cbd5e1'; */
        ctx.fillStyle = colors[i];

        // Arc
        const arcWidth = length * 0.1 + i * arcPadding;
        ctx.beginPath();
        ctx.arc(center.x, center.y, arcWidth, Math.PI, 0);
        ctx.stroke();

        // Dot
        /* S = t * V; */

        const t = progress;
        const v = calculateVelocity(i)
        const S = t * v;

        const maxAngle = Math.PI * 2;
        const angleScalar = (Math.PI + S) % maxAngle;
        const angle = angleScalar >= Math.PI ? angleScalar : maxAngle - angleScalar;

        const circleX = center.x + Math.cos(angle) * arcWidth;
        const circleY = center.y + Math.sin(angle) * arcWidth;
        ctx.beginPath();
        ctx.arc(circleX, circleY, 5, 0, Math.PI * 2);
        ctx.fill();

        if (currentTime > audioTimes[i]) {
          keys[i].pause()
          keys[i].currentTime = 0;
          audioTimes[i] = calculateNextImpactTime(audioTimes[i], v)
          keys[i].play()
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [])

  return (
    <div className="flex w-screen h-screen bg-slate-900">
      <div className='flex w-full h-full py-16 px-4 overflow-visible'>
        <canvas className="w-full max-w-[800px] h-full m-auto overflow-visible" ref={canvasRef}></canvas>
      </div>
    </div>
  )
}

export default App

const calculateVelocity = (index: number) => {
  const maxCycles = 80;
  const duration = 300;
  const numberOfCycles = maxCycles - index;
  const distancePerCycle = 2 * Math.PI;

  return (numberOfCycles * distancePerCycle) / duration;
}

const calculateNextImpactTime = (currentImpactTime: number, velocity: number) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
}
