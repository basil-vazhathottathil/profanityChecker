# Profanity Checker

This project is a simple profanity checker built using the Hono framework for Node.js. It reads a list of banned words from a CSV file and checks if a given text contains any of those words.

## Features

- Load banned words from a CSV file
- Check if a text contains any banned words
- Simple API with two endpoints

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/basil-vazhathottathil/profanityChecker.git
   cd profanityChecker
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `theri.csv` file in the root directory with the list of banned words. The file should have a header and each banned word on a new line.

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server will run at `http://localhost:3000`.

## API Endpoints

### Root Endpoint

- **URL:** `/`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "message": "⚡️ Tadaa!"
  }
  ```

### Profanity Check Endpoint

- **URL:** `/check`
- **Method:** `GET`
- **Query Parameters:**
  - `text`: The text to check for profanity.
- **Response:**
  ```json
  {
    "text": "your input text",
    "containsProfanity": true/false,
    "matchedWords": ["list", "of", "matched", "words"]
  }
  ```

## Example

To check if a text contains profanity, make a GET request to the `/check` endpoint with the `text` query parameter:
```bash
curl "http://localhost:3000/check?text=your_text_here"
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.