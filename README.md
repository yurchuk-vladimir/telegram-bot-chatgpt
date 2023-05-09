# telegram-bot-chatgpt

This is a Node.js application that can be run using Docker. Before running the application you need to fill out `config/production.json`.

## Installation
1. Clone the repository
2. Ensure that you have Docker installed
3. Open a terminal and navigate to the application's directory
4. Build the Docker image: `docker build -t <image_name> .` where `<image_name>` is the name you want to give to your Docker image, for example `myapp`

## Configuration
Before running the Docker container, make sure to fill out `config/production.json` with the following configuration options:
- `TELEGRAM_TOKEN`: Your API key for accessing the Telegram Bot API
- `OPENAI_KEY`: Your API key for OpenAI

Note: Make sure to keep your API keys secure by not committing them to version control.

## Running the Application
To run the application as a Docker container, execute the following command in your terminal:

```
docker run -d -p 3000:3000 --name <image_name> --rm <image_name>
```
