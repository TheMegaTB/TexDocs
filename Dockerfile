FROM rchurchley/texlive:metropolis

# Install curl and sudo
RUN apt-get update && apt-get install -f -y git curl sudo && apt-get clean

# Install nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && apt-get install -y nodejs build-essential

# Install pip2
RUN wget https://bootstrap.pypa.io/get-pip.py && python get-pip.py

# Install pygments
RUN pip install pygments

# Install the dependencies for the frontend
WORKDIR /usr/src/app/frontend
COPY frontend/package.json ./
RUN npm install

# Install the dependencies for the backend
WORKDIR /usr/src/app/backend
COPY backend/package.json ./
RUN npm install

# Build the frontend
WORKDIR /usr/src/app/frontend
COPY ./frontend/ .
RUN NODE_ENV='production' npm run build

# Copy the backend
WORKDIR /usr/src/app/backend
COPY ./backend/ .

WORKDIR /usr/src/app/backend
RUN ln -s /stor stor

EXPOSE 8080

CMD [ "npm", "start" ]