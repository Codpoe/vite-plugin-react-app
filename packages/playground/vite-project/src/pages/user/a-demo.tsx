/**
 * @title Hello world
 */
import { useState } from 'react';

export default function Test() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(count + 1)}>Hello World! {count}</div>;
}
