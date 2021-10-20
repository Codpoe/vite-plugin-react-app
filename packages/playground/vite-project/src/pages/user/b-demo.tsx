/**
 * @title Hello Test!
 */
import { useState } from 'react';

export default function TestB() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(count + 1)}>Hello Test {count}</div>;
}
