import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "c4923da2";

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const { movies, error, isloading } = useMovies(query);
  const [watched, setWatch] = useState(() =>
    JSON.parse(localStorage.getItem("watched"))
  );

  const handleSelectId = (id) => {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  };

  function onCloseMovie() {
    setSelectedId(null);
  }

  const handleWatchMovie = (newMovie) => {
    setWatch((watchedMovies) => [...watchedMovies, newMovie]);

    //add watched movie local browser storage
    //localStorage.setItem("watched", JSON.stringify([...watched, newMovie]));
  };

  const handleWatchedDelete = (id) => {
    setWatch((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        {/* alternativeto compostion technique pass element by props */}
        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              {" "}
              <Summary watched={watched} />
              <WatchMovieList watched={watched} />
            </>
          }
        /> */}

        {/* this is composton t4chnique to pass prefered one */}
        <Box>
          {isloading && <Loader />}
          {!isloading && !error && (
            <MovieList
              movies={movies}
              handleSelectId={handleSelectId}
              onCloseMovie={onCloseMovie}
            />
          )}
          {error && <ErrorMeesage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDeatils
              selectedId={selectedId}
              onCloseMovie={onCloseMovie}
              handleWatchMovie={handleWatchMovie}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchMovieList
                watched={watched}
                handleWatchedDelete={handleWatchedDelete}
              />
            </>
          )}
        </Box>
        <TrendingMoviesSlideshow />
        <ImdbLogo />
      </Main>
    </>
  );
}

function ImdbLogo() {
  return <div className="rightlogo">IMDb.</div>;
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <h1>IMDb</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const input = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === input.current) return;
    input.current.focus();
    setQuery("");
  });

  //Not a good way to select dom lement in react
  // useEffect(() => {
  //   const dom = document.querySelector(".search");
  //   //console.log(dom);
  //   dom.focus();
  // }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      ref={input}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

//this is props technique to use alternate of compostion
// function Box({ element }) {
//   const [isOpen, setIsOpen] = useState(true);
//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
//         {isOpen ? "–" : "+"}
//       </button>
//       {isOpen && element}
//     </div>
//   );
// }

//this compostion technique to reuse (prefered technique)
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading..</p>;
}

function ErrorMeesage({ message }) {
  return <p className="error">{message} ❌</p>;
}
function MovieList({ movies, handleSelectId, checkwatched }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <List
          movie={movie}
          key={movie.imdbID}
          handleSelectId={handleSelectId}
          checkwatched={checkwatched}
        />
      ))}
    </ul>
  );
}

function List({ movie, handleSelectId, checkwatched }) {
  return (
    <li
      key={movie.imdbID}
      onClick={() => {
        handleSelectId(movie.imdbID);
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDeatils({ selectedId, onCloseMovie, handleWatchMovie, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState();
  const isWatched = watched
    ? watched.map((movie) => movie.imdbID).includes(selectedId)
    : false;
  const countRating = useRef(0);
  const watchUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: diretor,
    Genre: genre,
  } = movie;

  //  console.log(title, year);

  function handleAdd() {
    const newWatchMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      userRating,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      countRating,
    };
    //console.log(newWatchMovie);
    handleWatchMovie(newWatchMovie);
    onCloseMovie();
  }
  useEffect(() => {
    if (userRating) countRating.current++;
  }, [userRating]);
  useKey("Escape", onCloseMovie);

  useEffect(
    function () {
      try {
        const fetchMovie = async () => {
          setLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );
          const data = await res.json();
          setLoading(false);
          setMovie(data);

          //console.log(data);
        };

        fetchMovie();
      } catch (err) {}
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      //it will retrun even component rerender
      return function () {
        document.title = "IMDb";

        //console.log(title);
        //it will console value of title even component is unmounted because of closure effect
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &null; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched === true ? (
                <p>
                  You already rated this movie! {watchUserRating}
                  <span>⭐</span>
                </p>
              ) : (
                <>
                  <StarRating
                    size={20}
                    maxRating={10}
                    handleState={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>directe by {diretor}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchMovieList({ watched, handleWatchedDelete }) {
  //console.log(watched);
  return (
    <ul className="list">
      {watched
        ? watched.map((movie) => (
            <WatchMovie
              movie={movie}
              key={movie.imdbID}
              handleWatchedDelete={handleWatchedDelete}
            />
          ))
        : []}
    </ul>
  );
}

function WatchMovie({ movie, handleWatchedDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleWatchedDelete(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(
    watched ? watched.map((movie) => movie.imdbRating) : []
  );
  const avgUserRating = average(
    watched ? watched.map((movie) => movie.userRating) : []
  );
  const avgRuntime = average(
    watched ? watched.map((movie) => movie.runtime) : []
  );
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched ? watched.length : 0} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function TrendingMoviesSlideshow() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const apiKey = "f0eed7c85b858c57115102795f2ed9f6";
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
        );
        const data = await response.json();
        setTrendingMovies(data.results);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      }
    };

    fetchTrendingMovies();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingMovies.length);
    }, 5000); // Change image every 5 seconds (adjust as needed)

    return () => clearInterval(interval);
  }, [currentIndex, trendingMovies.length]);

  return (
    <div className="trending-movies-slideshow">
      {trendingMovies.length > 0 && (
        <img
          src={`https://image.tmdb.org/t/p/w500${trendingMovies[currentIndex].poster_path}`}
          alt={`Trending Movie ${currentIndex + 1}`}
          style={{ height: "60.5rem", width: "58rem" }}
          className="image"
        ></img>
      )}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}
