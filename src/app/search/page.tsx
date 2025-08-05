import { unstable_ViewTransition as ViewTransition } from "react";
import SearchPage from "./search";

export default function Search() {
  return (
    <ViewTransition>
      <SearchPage />
    </ViewTransition>
  );
}
