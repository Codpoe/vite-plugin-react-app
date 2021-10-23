/**
 * @title Hello world
 */
import { useState } from 'react';

export type D = 'd1' | 'd2';

/**
 * 一些描述
 * 啊啊啊
 *
 * 呃1
 */
export interface TestProps {
  // 这？
  a: string;
  /**
   * 阿达
   */
  b: 'b1' | 'b2';
  /**
   * c的描述
   * @default '123'
   */
  c?: boolean;
  /**
   * d的描述
   */
  d: D;
}

export default function Test() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(count + 1)}>Hello World! {count}</div>;
}
