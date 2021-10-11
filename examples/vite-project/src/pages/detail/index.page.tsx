import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Detail() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Detail Page</h1>
      <Link to="b">to a page</Link>
      <p>
        <button type="button" onClick={() => setCount(count => count + 1)}>
          count is: {count}
        </button>
      </p>
    </>
  );
}
