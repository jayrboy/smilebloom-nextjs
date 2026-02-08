import Link from 'next/link';

function HomePage() {
  return (
    <div>
      <h1 className="text-7xl">Home Page</h1>
      <Link href="/auth/sign-in" className="text-xl text-blue-500 inline-block mt-8">
        sign in page
      </Link>
      <br />
      <Link href="/about" className="text-xl text-blue-500 inline-block mt-8">
        about page
      </Link>
    </div>
  );
}

export default HomePage;