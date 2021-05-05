const url = "http://localhost:5000/"
const serverSide = {
    base: url,
    login: url + 'user/login',
    signup: url + 'user/signup',
    registerPublisher: url + 'publisher/new',
    getPublisher: url + 'publisher/'
};

export default serverSide;