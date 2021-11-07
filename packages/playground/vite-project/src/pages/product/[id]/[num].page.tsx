import { useParams } from 'react-router-dom';

export default function NumPage() {
  const { id, num } = useParams<'id' | 'num'>();

  return (
    <>
      <h1>
        Product Page --- {id} --- {num}
      </h1>
    </>
  );
}
