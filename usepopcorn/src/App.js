import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "c4923da2";
//const query = "Interstellar";
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatch] = useState(() =>
    JSON.parse(localStorage.getItem("watched"))
  );
  const [query, setQuery] = useState("");
  const [isloading, setloading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const handleSelectId = (id) => {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  };

  const onCloseMovie = () => {
    setSelectedId(null);
  };

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

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setloading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Something went Wrong");
        const data = await res.json();

        if (data.Response === "False") {
          //console.log(data.Error);
          throw new Error(data.Error);
        }

        setMovies(data.Search);
        setError("");
      } catch (err) {
        console.log(err.message);
        console.log(err.name);

        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setloading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    onCloseMovie();
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);
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
      </Main>
    </>
  );
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

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === input.current) return;

      if (e.code === "Enter") {
        input.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);
    return () => document.addEventListener("keydown", callback);
  }, [setQuery]);
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
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
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

  useEffect(
    function () {
      const callback = (e) => {
        if (e.code === "Escape") {
          onCloseMovie();
          console.log("close");
        }
      };
      document.addEventListener("keydown", callback);

      //it is neccessay to remove event listener other wise useffcet add same evenlistiner multiple times
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      try {
        const fetchMovie = async () => {
          setLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
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
      {watched.map((movie) => (
        <WatchMovie
          movie={movie}
          key={movie.imdbID}
          handleWatchedDelete={handleWatchedDelete}
        />
      ))}
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
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
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

function Main({ children }) {
  return <main className="main">{children}</main>;
}
