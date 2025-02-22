import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/use-user';

export default function MyProtectedPage() {
  const user = useUser();
  const navigate = useNavigate();

  if (!user) {
    // Redirect to sign in page
    navigate('/sign-in');
  }

  return (
    <>
      <p>Welcome back{user.firstName && `, ${user.firstName}`}</p>
    </>
  );
}
