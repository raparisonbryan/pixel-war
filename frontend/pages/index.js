import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [pseudo, setPseudo] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("pseudo", pseudo);
    router.push("/game");
  };

  return (
    <div className={styles.container}>
      <h1>Bienvenue dans le Jeu</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Entrez votre pseudo"
          className={styles.input}
        />
        <button type="Envoyer" className={styles.button}>
          Jouer
        </button>
      </form>
    </div>
  );
}
