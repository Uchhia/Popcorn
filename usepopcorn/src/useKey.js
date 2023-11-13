import { useEffect } from "react";
export function useKey(key, action) {
  useEffect(
    function () {
      const callback = (e) => {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
          console.log("close");
        }
      };
      document.addEventListener("keydown", callback);

      //it is neccessay to remove event listener other wise useffcet add same evenlistiner multiple times
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [key, action]
  );
}
