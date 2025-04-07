import React, { useEffect, useState } from "react";

const AnimePlanner: React.FC = () => {
  const [animeList, setAnimeList] = useState<
    { title: string; day: string; time: string; image: string }[]
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
              coverImage {
                large
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
          image: anime.coverImage.large,
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
    <div className="anime-planner">
      <h1>PLANNING</h1>
      <div className="anime-list">
        {['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'].map((day) => (
          <div key={day} className="day-column">
            <div className="day-header">{day}</div>
            {animeList
              .filter(anime => anime.day.toUpperCase() === day)
              .map((anime, index) => (
          <li key={index} className="anime-item">
            <img src={anime.image} alt={anime.title} className="anime-image" />
            <div className="anime-title">{anime.title}</div>
            <div className="anime-time">
              {anime.day} à {anime.time}
            </div>
            
          </li>
        ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimePlanner;