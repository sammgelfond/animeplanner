import React, { useEffect, useState } from "react";

const titleMapping: { [key: string]: string } = {
  "Mashle": "mashle-magic-and-muscles",
  "Black Clover": "black-clover-tv",
  "Demon Slayer": "kimetsu-no-yaiba",
  "My Hero Academia": "boku-no-hero-academia",
  "Haite Kudasai, Takamine-san": "please-put-them-on-takamine-san",
  // Ajoutez d'autres mappings ici selon vos besoins
};

const getVoirAnimeInfo = async (title: string): Promise<{ url: string; title: string } | null> => {
  try {
    const searchUrl = "https://v6.voiranime.com/wp-admin/admin-ajax.php";
    const formData = new FormData();
    formData.append('action', 'wp_manga_get_search_suggest');
    formData.append('title', title);

    const response = await fetch(searchUrl, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        // Trouver l'anime le plus pertinent
        const bestMatch = data.find((item: any) => 
          item.title.toLowerCase().includes(title.toLowerCase())
        ) || data[0];
        
        return {
          url: bestMatch.url,
          title: bestMatch.title
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la recherche sur VoirAnime:", error);
    return null;
  }
};

const AnimePlanner: React.FC = () => {
  const [animeList, setAnimeList] = useState<
    { title: string; day: string; time: string; image: string; voirAnimeUrl?: string; voirAnimeTitle?: string }[]
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
      const animes = await Promise.all(data.data.Page.media.map(async (anime: any) => {
        const voirAnimeInfo = await getVoirAnimeInfo(anime.title.romaji);
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
          voirAnimeUrl: voirAnimeInfo?.url,
          voirAnimeTitle: voirAnimeInfo?.title
        };
      }));
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
              href={anime.voirAnimeUrl}
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