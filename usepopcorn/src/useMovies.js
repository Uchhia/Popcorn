import { useState, useEffect } from "react";
const KEY = "c4923da2";
export function useMovies(query) {
  //callback?.();
  const [movies, setMovies] = useState([]);
  const [isloading, setloading] = useState(false);
  const [error, setError] = useState("");

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
    // onCloseMovie();
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);
  return { movies, error, isloading };
}
