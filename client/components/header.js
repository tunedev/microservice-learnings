import Link from 'next/link';

export const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign in', href: '/auth/signin' },
    currentUser && { label: 'New Ticket', href: '/tickets/new' },
    currentUser && { label: 'Order History', href: '/orders' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((link) => link)
    .map(({ label, href }) => (
      <li key={href}>
        <Link className='nav-item' href={href}>
          <a className='nav-link'>{label}</a>
        </Link>
      </li>
    ));

  return (
    <nav className='navbar navbar-light bg-light py-2'>
      <Link href='/'>
        <a className='navbar-brand'>Tunedev</a>
      </Link>
      <div className='d-flex justify-content-end'>
        <ul className='nav d-flex align-items-center'>{links}</ul>
      </div>
    </nav>
  );
};
