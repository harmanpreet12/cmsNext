import Navbar from '../components/Navbar';

export default function About() {
  return (
    <>
      <Navbar />
      <main style={{ marginTop: '80px', textAlign: 'center' }}>
        <h1>About Page</h1>
        <p>This is the About page.</p>
      </main>
    </>
  );
}