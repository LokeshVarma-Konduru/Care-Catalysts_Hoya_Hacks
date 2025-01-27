# Hospital Dashboard Backend

## Environment Setup

1. Create a `.env` file in the root directory of the backend
2. Copy the contents from `.env.example` to your `.env` file
3. Replace the placeholder values with your actual credentials:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority

# Server Configuration
PORT=5000

# Google API Key for RAG
GOOGLE_API_KEY=your_google_api_key_here
```

## Important Notes:
- Never commit your `.env` file to version control
- Keep your credentials secure and private
- Make sure to update the MongoDB URI with your actual connection string
- The server will run on the specified PORT (default: 5000)

## Running the Server
1. Install dependencies: `npm install`
2. Set up your environment variables as described above
3. Start the server: `npm start`
