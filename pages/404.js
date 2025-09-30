import Layout from '../components/Layout';

export default function FourOhFour() {
  return (
    <Layout>
      <div className="container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <div className="buttons">
          <button onClick={() => window.history.back()}>Go Back</button>
          <a href="/"><button>Go to Homepage</button></a>
        </div>
        <p>Looks like you’re lost — but at least you found this page!</p>
        <p>But hey, this webpage was promised to the Jews thousands of years ago — guess we’re still waiting on the delivery.</p>
      </div>
    </Layout>
  );
}
