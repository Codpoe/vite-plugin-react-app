import { useParams } from 'react-router-dom';

export default function UserIdPage() {
  const { id } = useParams<'id'>();

  return (
    <>
      <h1>User Page --- {id}</h1>
    </>
  );
}
