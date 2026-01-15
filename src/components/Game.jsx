import { useState, useEffect, useRef, useCallback } from 'react'
import './Game.css'

const Game = () => {
    const GAME_WIDTH = 800
    const GAME_HEIGHT = 600
    const CAR_WIDTH = 80
    const CAR_HEIGHT = 120
    const OBSTACLE_WIDTH = 60
    const OBSTACLE_HEIGHT = 60
    const OBSTACLE_SPEED = 4
    const OBSTACLE_SPAWN_RATE = 800 // millisecondi - più veloce
    const CAT_SPEED = 0.5 // velocità movimento gattino
    const CAT_MIN_POSITION = 10
    const CAT_MAX_POSITION = 90
    const MAX_LIVES = 4

    const [gameStarted, setGameStarted] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [gameWon, setGameWon] = useState(false) // stato vittoria
    const [lives, setLives] = useState(MAX_LIVES) // vite iniziali
    const [score, setScore] = useState(0)
    const [carPositionX, setCarPositionX] = useState(50) // percentuale da sinistra
    const carPositionY = 20 // percentuale dal basso (fisso)
    const [catPosition, setCatPosition] = useState(50) // posizione gattino in percentuale
    const [catDirection, setCatDirection] = useState(1) // direzione movimento gattino: 1 = destra, -1 = sinistra
    const [obstacles, setObstacles] = useState([])
    const [carGlow, setCarGlow] = useState(false) // effetto illuminazione quando evita
    const [carHit, setCarHit] = useState(false) // effetto lampeggio rosso quando colpita
    const gameAreaRef = useRef(null)
    const animationFrameRef = useRef(null)
    const obstacleIntervalRef = useRef(null)
    const catMovementRef = useRef(null)
    const catPositionRef = useRef(50) // ref per la posizione corrente del gattino

    // Emoji per gli ostacoli
    const obstacleEmojis = ['📧', '😠', '😡', '📨']

    // Calcola i limiti per la macchina
    const CAR_MIN_X = (CAR_WIDTH / 2 / GAME_WIDTH) * 100
    const CAR_MAX_X = 100 - (CAR_WIDTH / 2 / GAME_WIDTH) * 100

    // Funzione per muovere a sinistra
    const moveLeft = useCallback(() => {
        if (gameStarted && !gameOver && !gameWon) {
            setCarPositionX((prev) => Math.max(CAR_MIN_X, prev - 5))
        }
    }, [gameStarted, gameOver, gameWon, CAR_MIN_X])

    // Funzione per muovere a destra
    const moveRight = useCallback(() => {
        if (gameStarted && !gameOver && !gameWon) {
            setCarPositionX((prev) => Math.min(CAR_MAX_X, prev + 5))
        }
    }, [gameStarted, gameOver, gameWon, CAR_MAX_X])

    // Movimento macchina con tastiera
    useEffect(() => {
        if (gameStarted && !gameOver && !gameWon) {
            const handleKeyPress = (e) => {
                if (e.key === 'ArrowLeft') {
                    moveLeft()
                } else if (e.key === 'ArrowRight') {
                    moveRight()
                }
            }

            window.addEventListener('keydown', handleKeyPress)
            return () => window.removeEventListener('keydown', handleKeyPress)
        }
    }, [gameStarted, gameOver, gameWon, moveLeft, moveRight])

    // Movimento gattino avanti e indietro
    useEffect(() => {
        if (gameStarted && !gameOver && !gameWon) {
            const moveCat = () => {
                setCatPosition((prev) => {
                    let newPos = prev + catDirection * CAT_SPEED

                    if (newPos >= CAT_MAX_POSITION) {
                        setCatDirection(-1)
                        catPositionRef.current = CAT_MAX_POSITION
                        return CAT_MAX_POSITION
                    } else if (newPos <= CAT_MIN_POSITION) {
                        setCatDirection(1)
                        catPositionRef.current = CAT_MIN_POSITION
                        return CAT_MIN_POSITION
                    }

                    catPositionRef.current = newPos
                    return newPos
                })
            }

            catMovementRef.current = setInterval(moveCat, 16) // ~60fps

            return () => {
                if (catMovementRef.current) {
                    clearInterval(catMovementRef.current)
                }
            }
        }
    }, [gameStarted, gameOver, catDirection])

    // Generazione ostacoli e game loop
    useEffect(() => {
        if (gameStarted && !gameOver && !gameWon) {
            // Genera ostacoli dalla posizione del gattino
            obstacleIntervalRef.current = setInterval(() => {
                const randomEmoji = obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)]
                setObstacles((prev) => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        x: catPositionRef.current, // Parte dalla posizione corrente del gattino
                        y: 30, // Posizione iniziale in alto
                        emoji: randomEmoji,
                    },
                ])
            }, OBSTACLE_SPAWN_RATE)

            // Game loop
            const gameLoop = () => {
                if (!gameStarted || gameOver || gameWon) return

                setObstacles((prevObstacles) => {
                    const updated = prevObstacles.map((obstacle) => ({
                        ...obstacle,
                        y: obstacle.y + OBSTACLE_SPEED,
                    }))

                    // Controlla collisioni
                    const carLeft = (carPositionX / 100) * GAME_WIDTH - CAR_WIDTH / 2
                    // carPositionY è percentuale dal basso, quindi il top della macchina è:
                    // GAME_HEIGHT - (carPositionY/100 * GAME_HEIGHT) - CAR_HEIGHT
                    const carBottom = (carPositionY / 100) * GAME_HEIGHT
                    const carTop = GAME_HEIGHT - carBottom - CAR_HEIGHT

                    let hasCollision = false
                    const filtered = updated.filter((obstacle) => {
                        // Rimuovi ostacoli fuori schermo
                        if (obstacle.y > GAME_HEIGHT) {
                            setScore((prev) => {
                                const newScore = prev + 10
                                if (newScore >= 100 && !gameWon) {
                                    setGameWon(true)
                                    setGameStarted(false)
                                }
                                return newScore
                            })
                            setCarGlow(true)
                            setTimeout(() => setCarGlow(false), 200)
                            return false
                        }

                        // Controlla collisioni
                        const obstacleLeft = (obstacle.x / 100) * GAME_WIDTH - OBSTACLE_WIDTH / 2
                        const obstacleTop = obstacle.y

                        if (
                            carLeft < obstacleLeft + OBSTACLE_WIDTH &&
                            carLeft + CAR_WIDTH > obstacleLeft &&
                            carTop < obstacleTop + OBSTACLE_HEIGHT &&
                            carTop + CAR_HEIGHT > obstacleTop
                        ) {
                            hasCollision = true
                            return false
                        }

                        return true
                    })

                    if (hasCollision) {
                        setCarHit(true)
                        setTimeout(() => setCarHit(false), 300)
                        setLives((prevLives) => {
                            const newLives = prevLives - 1
                            if (newLives <= 0) {
                                setGameOver(true)
                                setGameStarted(false)
                            }
                            return newLives
                        })
                    }

                    return filtered
                })

                animationFrameRef.current = requestAnimationFrame(gameLoop)
            }

            animationFrameRef.current = requestAnimationFrame(gameLoop)

            return () => {
                if (obstacleIntervalRef.current) {
                    clearInterval(obstacleIntervalRef.current)
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                }
            }
        }
    }, [gameStarted, gameOver, gameWon, carPositionX, OBSTACLE_SPAWN_RATE, OBSTACLE_SPEED])

    const startGame = () => {
        setGameStarted(true)
        setGameOver(false)
        setGameWon(false)
        setLives(MAX_LIVES)
        setScore(0)
        setCarPositionX(50)
        setCatPosition(50)
        catPositionRef.current = 50
        setCatDirection(1)
        setObstacles([])
        setCarGlow(false)
        setCarHit(false)
    }

    const resetGame = () => {
        setGameOver(false)
        setGameWon(false)
        setGameStarted(false)
        setLives(MAX_LIVES)
        setScore(0)
        setCarPositionX(50)
        setCatPosition(50)
        catPositionRef.current = 50
        setCatDirection(1)
        setObstacles([])
        setCarGlow(false)
        setCarHit(false)
        if (obstacleIntervalRef.current) {
            clearInterval(obstacleIntervalRef.current)
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }
        if (catMovementRef.current) {
            clearInterval(catMovementRef.current)
        }
    }

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>🎂 Buon Compleanno! 🎮</h1>
                <div className="score">Punteggio: {score}</div>
                <div className="lives-container">
                    {[...Array(MAX_LIVES)].map((_, i) => (
                        <span key={i} className={`heart ${i < lives ? 'heart-full' : 'heart-empty'}`}>
                            ❤️
                        </span>
                    ))}
                </div>
            </div>

            <div
                ref={gameAreaRef}
                className="game-area"
                style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            >
                {/* Strada */}
                <div className="road">
                    {/* Linee della strada */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="road-line"
                            style={{
                                left: '50%',
                                top: `${(i * 20) % 100}%`,
                                transform: 'translateX(-50%)',
                            }}
                        />
                    ))}

                    {/* Macchina sportiva */}
                    <div
                        className={`car ${carGlow ? 'car-glow' : ''} ${carHit ? 'car-hit' : ''}`}
                        style={{
                            left: `${carPositionX}%`,
                            bottom: `${carPositionY}%`,
                            transform: 'translate(-50%, 50%)',
                        }}
                    >
                        <img src="honda.png" alt="Macchina sportiva" className="car-image" />
                    </div>

                    {/* Ostacoli (email/clienti arrabbiati) */}
                    {obstacles.map((obstacle) => (
                        <div
                            key={obstacle.id}
                            className="obstacle"
                            style={{
                                left: `${obstacle.x}%`,
                                top: `${(obstacle.y / GAME_HEIGHT) * 100}%`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            {obstacle.emoji}
                        </div>
                    ))}

                    {/* Gattino blu di prussia che lancia */}
                    <div
                        className="cat-thrower"
                        style={{
                            left: `${catPosition}%`,
                            top: '20px',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <img src="cuccioli-blu-di-russia.png" alt="Cucciolo blu di prussia" className="cat-image" />
                    </div>
                </div>
            </div>

            {!gameStarted && (
                <div className="start-screen">
                    {gameWon ? (
                        <div className="victory-screen">
                            <div className="victory-glow"></div>
                            <h2 className="victory-title">TANTI AUGURI!!</h2>
                            <p>Punteggio finale: {score}</p>
                            <p className="victory-message">🎉🎂🎉</p>
                            <button onClick={resetGame} className="game-button">
                                Ricomincia
                            </button>
                        </div>
                    ) : gameOver ? (
                        <>
                            <h2>Game Over! 😿</h2>
                            <p>Punteggio finale: {score}</p>
                            <button onClick={resetGame} className="game-button">
                                Ricomincia
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>Evita Email e Clienti Arrabbiati! 🎮</h2>
                            <p>Usa le frecce ← → per muoverti</p>
                            <p>Raggiungi 100 punti per vincere!</p>
                            <button onClick={startGame} className="game-button">
                                Inizia
                            </button>
                        </>
                    )}
                </div>
            )}

            {gameStarted && (
                <>
                    <div className="controls-info">
                        <p>← → per muoverti</p>
                    </div>
                    {/* Controlli touch per mobile */}
                    <div className="touch-controls">
                        <button
                            className="touch-button touch-left"
                            onTouchStart={(e) => {
                                e.preventDefault()
                                moveLeft()
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                moveLeft()
                            }}
                            onTouchEnd={(e) => e.preventDefault()}
                            onMouseUp={(e) => e.preventDefault()}
                            aria-label="Muovi sinistra"
                        >
                            ←
                        </button>
                        <button
                            className="touch-button touch-right"
                            onTouchStart={(e) => {
                                e.preventDefault()
                                moveRight()
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                moveRight()
                            }}
                            onTouchEnd={(e) => e.preventDefault()}
                            onMouseUp={(e) => e.preventDefault()}
                            aria-label="Muovi destra"
                        >
                            →
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default Game