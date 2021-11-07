/**
 * @title hello
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function C() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Detail C Page</h1>
      <Link to="/user">to user2 page</Link>
      <p>
        <button type="button" onClick={() => setCount(count => count + 1)}>
          count is: {count}
        </button>
      </p>
    </>
  );
}
