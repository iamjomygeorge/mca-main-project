"use client";

import { useState } from "react";
import { ReactReader } from "react-reader";

export default function EpubReader({ url }) {
  const [location, setLocation] = useState(null);

  const locationChanged = (epubcifi) => {
    setLocation(epubcifi);
  };

  return (
    <div className="h-full w-full relative bg-white dark:bg-zinc-800">
      <ReactReader
        url={url}
        location={location}
        locationChanged={locationChanged}
        title={null}
        epubOptions={{
          flow: "scrolled",
        }}
      />
    </div>
  );
}
