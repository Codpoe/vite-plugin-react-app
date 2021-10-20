import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function A() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Detail A Page</h1>
      <Link to="/user">to user2 page</Link>
      <p>
        <button type="button" onClick={() => setCount(count => count + 1)}>
          count is: {count}
        </button>
      </p>
    </>
  );
}
