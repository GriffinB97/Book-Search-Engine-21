const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');

// Import your typeDefs and resolvers
const { typeDefs, resolvers } = require('./schema');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the React app's static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../client/dist');
  console.log(`Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
}

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Add your authentication middleware or other context properties here
  },
});

// Apply Apollo Server middleware to the Express app
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  // Serve the React app for any route not handled by API
  app.get('*', (req, res) => {
    const filePath = path.join(__dirname, '../client/dist/index.html');
    console.log(`Attempting to serve file: ${filePath}`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error serving file: ${err.message}`);
        res.status(500).send('An error occurred while serving the file.');
      }
    });
  });

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`🚀 GraphQL is available at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

startApolloServer();
