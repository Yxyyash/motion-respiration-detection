# Respiration Rate Count Based On Shoulder Detection Demo

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/username/repository.svg)](https://github.com/username/repository/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/username/repository.svg)](https://github.com/username/repository/pulls)

## Description

A demonstration for calculating human respiration rate using y-axis shoulder motion using React as the frontend and Flask as the backend.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation

In order to run the app frontend, you need to have node.js and npm installed in your hardware if you haven't, to do this you will need to download and install Node.js from the official website: https://nodejs.org/. Follow the installation instructions for your operating system.

Afterwards, download the files in this repo or clone my project, to do this navigate to your preferred file path then in the cmd then run:

```bash
git clone https://github.com/Yxyyash/motion-respiration-detection.git
```

Then, to install the required libraries for the frontend files you can open cmd and run:

```bash
cd motion-respiration-detection/frontend
npm install
```
Then you're done for the frontend! Next for the backend to run you will need to have Python installed, to download access visit the official Python website at [https://www.python.org/](#https://www.python.org/). Go to the Downloads section and download the latest version of Python for Windows/Linux/Mac. Skip this step if you're already have Python installed.

Then to install the required libraries for backend, open cmd and run:

```bash
cd motion-respiration-detection/backend
pip install . # or pip install motion-flask
```

## Usage

To use the app, you will need to run the react web server and flask backend file simultaneously in their separate terminals.

First, navigate to the "frontend" folder and start the web server:

```bash
npm start
```

Second, navigate to the "backend" folder and start the flask server:

```bash
py app.py
```

Finally, you can open [http://localhost:3000](http://localhost:3000) to view it in the browser and try out the app.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
