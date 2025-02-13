import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';

const sliderSettings = {
  dots: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: true
};

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/fetch-news');
      setArticles(response.data);
    } catch (error) {
      setError('Failed to fetch news. Please try again later.');
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    try {
      setLoading(true);
      await axios.post('/api/send-email', { articles });
      alert('News sent via email!');
    } catch (error) {
      alert('Failed to send email. Please try again.');
      console.error('Email error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Σημερινές Ειδήσεις</h1>
        <button onClick={fetchNews} className="fetch-button" disabled={loading}>
          Διαβάστε Ειδήσεις
        </button>
      </header>

      <div className="news-slider">
        {articles.length > 0 ? (
          <Slider {...sliderSettings}>
            {articles.map((article, i) => (
              <div className="news-slide" key={i}>
                <h3>{article.titleGreece}</h3>
                <p className="summary">{article.summary}</p>
                <div className="article-info">
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                    {article.source}
                  </a>
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="no-news">No news articles available</p>
        )}
      </div>

      <footer className="app-footer">
        <button onClick={handleEmail} className="email-button" disabled={loading || articles.length === 0}>
          Αποστολή Ειδήσεων Στο Email
        </button>
        <p>Designed by KMeleka</p>
      </footer>
    </div>
  );
}

export default App;
