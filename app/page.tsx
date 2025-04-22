import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ marginTop: '80px' }}>
        <h1>Home Page</h1>
        <p>Welcome to the Home page!</p>
      </main>
    </>
  );
}