import { redirect } from 'next/navigation';

// Redirect to the arena for AI comparison
export default function ComparePage() {
  redirect('/arena');
}
