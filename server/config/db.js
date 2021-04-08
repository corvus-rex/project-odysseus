import mongoose from 'mongoose';
import express from 'express';
import config from './config.js';

export const CONNECTION_URL = `mongodb+srv://${config.username}:${config.password}@cluster0.6njia.mongodb.net/${config.db}?retryWrites=true&w=majority`;

export const initiateServer = (PORT, CONNECTION_URL, app) => {
    mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(PORT, () => (console.log(`Server running on port ${PORT}`))))
    .catch((error) => console.log(error.message));
    mongoose.set('useFindAndModify', false);
};