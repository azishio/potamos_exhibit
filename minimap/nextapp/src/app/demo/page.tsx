"use client";

import { useEffect, useState } from "react";

function Example() {
  const [data, setData] = useState(null);

  async function fetchData() {
    const response = await fetch("/last-location");
    const data = await response.json();
    console.log(data);
    setData(data);
  }

  useEffect(() => {
    const timer = setTimeout(fetchData, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
}

export default Example;
