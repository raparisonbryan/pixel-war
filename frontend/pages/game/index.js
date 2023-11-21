import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import styles from "@/styles/Game.module.css";

export default function Game() {
  const [selectedColor, setSelectedColor] = useState("red");
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [pseudo, setPseudo] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const storedPseudo = localStorage.getItem("pseudo");
    if (storedPseudo) {
      setPseudo(storedPseudo);
    } else {
      window.location.href = "/";
    }

    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onopen = () => {
      if (storedPseudo) {
        wsRef.current.send(
          JSON.stringify({ action: "join", data: { pseudo: storedPseudo } })
        );
      }
    };

    wsRef.current.onmessage = (event) => {
      const { action, data } = JSON.parse(event.data);
      if (action === "draw" && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        const gridSize = 10;
        ctx.fillStyle = data.color;
        ctx.fillRect(data.x, data.y, gridSize, gridSize);
      } else if (action === "init" && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        const gridSize = 10;
        data.forEach((point) => {
          ctx.fillStyle = point.color;
          ctx.fillRect(point.x, point.y, gridSize, gridSize);
        });
      } else if (action === "users") {
        setUsers(data);
      } else if (action === "new_message") {
        setMessages((prev) => [...prev, data]);
      } else if (action === "init_chat") {
        setMessages(data);
      }
    };
    return () => {
      wsRef.current.close();
    };
  }, []);

  const handleCanvasClick = (e) => {
    if (canvasRef.current && wsRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const gridSize = 10;
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;
      x = Math.floor(x / gridSize) * gridSize;
      y = Math.floor(y / gridSize) * gridSize;

      const id = `${x} , ${y}`;
      const data = { action: "draw", data: { id, x, y, color: selectedColor } };

      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  };

  const handleSendMessage = (message) => {
    const data = { action: "chat", data: { message, user: pseudo } };
    wsRef.current.send(JSON.stringify(data));
  };

  return (
    <>
      <Head>
        <title>Pixel war</title>
        <meta name="description" content="Pixel war par Bryan Raparison" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.usersContainer}>
            <div className={styles.users}>
              <h2>Bienvenue, {pseudo} </h2>
              <p>Joueurs actifs:</p>
              <ul>
                {users.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              id="canvas"
              width={500}
              height={500}
              onClick={handleCanvasClick}
              className={styles.canvas}
            ></canvas>
            <div className={styles.colorsBloc}>
              <div className={styles.colorsWrapper}>
                <button
                  className={`${styles.colorButton} ${styles.red} ${
                    selectedColor === "red" ? styles.selectedColorButton : ""
                  }`}
                  onClick={() => setSelectedColor("red")}
                ></button>
              </div>
              <div className={styles.colorsWrapper}>
                <button
                  className={`${styles.colorButton} ${styles.blue} ${
                    selectedColor === "blue" ? styles.selectedColorButton : ""
                  }`}
                  onClick={() => setSelectedColor("blue")}
                ></button>
              </div>
              <div className={styles.colorsWrapper}>
                <button
                  className={`${styles.colorButton} ${styles.yellow} ${
                    selectedColor === "yellow" ? styles.selectedColorButton : ""
                  }`}
                  onClick={() => setSelectedColor("yellow")}
                ></button>
              </div>
              <div className={styles.colorsWrapper}>
                <button
                  className={`${styles.colorButton} ${styles.black} ${
                    selectedColor === "black" ? styles.selectedColorButton : ""
                  }`}
                  onClick={() => setSelectedColor("black")}
                ></button>
              </div>
              <div className={styles.colorsWrapper}>
                <button
                  className={`${styles.colorButton} ${styles.green} ${
                    selectedColor === "green" ? styles.selectedColorButton : ""
                  }`}
                  onClick={() => setSelectedColor("green")}
                ></button>
              </div>
            </div>
            <div>
              <div className={styles.colorsWrapper}>
                <button
                  className={styles.eraseButton}
                  onClick={() => setSelectedColor("white")} // pas eu le temps de faire un vrai moyen d'effacer
                >
                  erase point
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.chat}>
          <div className={styles.chatWrapper}>
            {messages.map((msg, index) => (
              <article className={styles.messageWrapper} key={index}>
                <strong>{msg.user}:</strong> {msg.message}
              </article>
            ))}
          </div>
          <form
            className={styles.chatInput}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(e.target.elements.message.value);
              e.target.elements.message.value = "";
            }}
          >
            <input
              className={styles.chatText}
              name="message"
              placeholder="Ecrivez un message"
            />
            <button className={styles.chatButton}>Envoyer</button>
          </form>
        </div>
      </main>
    </>
  );
}
