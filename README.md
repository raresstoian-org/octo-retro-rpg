# octo-retro-rpg
A small retro browser RPG demo game for self study.

## Setup & Run

1. Install npm packages:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Docker

1. Build the Docker image:
   ```bash
   docker build -t octo-retro-rpg .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8080:80 --name octo-retro-rpg octo-retro-rpg
   ```
3. Open `http://localhost:8080` in your browser.


