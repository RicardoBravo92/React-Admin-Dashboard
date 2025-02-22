import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@workos-inc/authkit-react';

export default function Login() {
  const { signIn } = useAuth();
  const [params] = useSearchParams();
  const context = params.get('context') ?? undefined;
  signIn({ context });
  return null;
}
