const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Fetch news from NewsAPI.org
app.get('/api/fetch-news', async (req, res) => {
  try {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const formattedDate = yesterday.toISOString().split('T')[0];
    const apiKey = process.env.NEWS_API_KEY;

    const response = await axios.get(
      `https://newsapi.org/v2/everything?language=el&sortBy=publishedAt&from=${formattedDate}&pageSize=10&qNot=sport%7Cfootball%7Cbasketball&apiKey=${apiKey}`
    );

    const articles = response.data.articles.map(article => ({
      titleGreece: article.title,
      titleEnglish: article.title,
      summary: article.description || 'No summary available',
      source: article.source.name,
      date: article.publishedAt,
      link: article.url
    }));

    res.json(articles);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Send email functionality
app.post('/api/send-email', (req, res) => {
  try {
    const { articles } = req.body;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Your Daily Greek News',
      text: generateEmailBody(articles)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Email sending failed');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully');
      }
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).send('Email sending failed');
  }
});

function generateEmailBody(articles) {
  let body = `Here's your daily news report (auto-generated):\n\n`;
  articles.forEach((article, i) => {
    body += `\n${i + 1}. ${article.titleGreece}\n`;
    body += `Source: ${article.source}\n${article.link}\n`;
    body += `Summary: ${article.summary.replace(/(<([^>]+)>)/gi, '')}\n`;
  });
  return body;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
