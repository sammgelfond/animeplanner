import React, { useEffect, useState } from "react";

const AnimePlanner: React.FC = () => {
  const [animeList, setAnimeList] = useState<
    { title: string; day: string; time: string }[]
  >([]);

  useEffect(() => {
    const fetchAnimes = async () => {
      const query = `
        query {
          Page(perPage: 20) {
            media(season: SPRING, seasonYear: 2025, type: ANIME, format: TV, status: RELEASING) {
              title {
                romaji
              }
              airingSchedule(notYetAired: true, perPage: 1) {
                nodes {
                  airingAt
                }
              }
            }
          }
        }
      `;

      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const animes = data.data.Page.media.map((anime: any) => {
        const airingAt = anime.airingSchedule.nodes[0]?.airingAt;
        const date = airingAt ? new Date(airingAt * 1000) : null;
        return {
          title: anime.title.romaji,
          day: date
            ? date.toLocaleDateString("fr-FR", { weekday: "long" })
            : "Inconnu",
          time: date
            ? date.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Bientôt",
        };
      });
      setAnimeList(animes);
    };

    fetchAnimes();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Planning des animés (Printemps 2025)</h1>
      <ul>
        {animeList.map((anime, index) => (
          <li key={index}>
            <strong>{anime.title}</strong> — {anime.day} à {anime.time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnimePlanner;