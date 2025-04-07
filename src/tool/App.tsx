import React, { useEffect, useState } from "react";

const titleMapping: { [key: string]: string } = {
  "Mashle": "mashle-magic-and-muscles",
  "Black Clover": "black-clover-tv",
  "Demon Slayer": "kimetsu-no-yaiba",
  "My Hero Academia": "boku-no-hero-academia",
  "Haite Kudasai, Takamine-san": "please-put-them-on-takamine-san",
  // Ajoutez d'autres mappings ici selon vos besoins
};

const getVoirAnimeSlug = async (title: string): Promise<string> => {
  try {
    // Essaie d'abord le mapping
    for (const [key, value] of Object.entries(titleMapping)) {
      if (title.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Fait une requête à VoirAnime pour chercher l'anime
    const searchUrl = `https://v6.voiranime.com/anime/${title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")}`;
      
    const response = await fetch(searchUrl);
    if (response.ok) {
      const text = await response.text();
      // Extrait le slug depuis l'URL de la page
      const match = text.match(/<link rel="canonical" href="https:\/\/v6\.voiranime\.com\/anime\/([^"]+)"/);
      if (match) {
        return match[1];
      }
    }
    
    // Si rien ne fonctionne, retourne la transformation par défaut
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  } catch (error) {
    console.error("Erreur lors de la récupération du slug:", error);
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }
};

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
            <a 
              href={`https://v6.voiranime.com/anime/${await getVoirAnimeSlug(anime.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="watch-link"
            >
              Regarder
            </a>
          </li>
        ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimePlanner;