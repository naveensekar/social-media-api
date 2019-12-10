# Social Media REST API

A powerful REST API for social media applications, powered by Node.js, Express & MongoDB.

### Features
* Token based Authentication (JWT)
* Auto image processing and compression while uploading
* Uploads are stored in AWS S3
* File upload progress will be sent to client using web sockets
* Realtime Notifications for events using Socket.IO
* Sockets available for Push Notifications
* Threaded Reply system
* Tag/Topic wise grouping for posts (forum like community)
* and much more coming soon.

API Documention is under progress and will be updated soon.

> ### Front-end
> I have also designed the front-end and developing the same using React.js and Ant Design. Will share the same in a separate repository soon.

## Running the API
1. Create or rename the .env.sample file to .env with the below required variables. Makes sure to replace the values based on your dev environment.

    ```
    #JWT Config
    JWT=your_secret_key

    #AWS Access
    AWS_ACCESS_ID=your_aws_id
    AWS_SECRET_KEY=your_aws_secret_key
    AWS_BUCKET=bucket_name

    #DB Config
    DB_HOST=localhost
    DB_PORT=27017
    DB_NAME=social-media
    ```

1. Run `npm install` to install all the dependencies.
1. Start MongoDB Deamon by typing `mongod` in the console.
1. Finally run `npm start` to start the server.
