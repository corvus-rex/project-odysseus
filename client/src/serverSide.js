const url = "http://localhost:5000/"
const serverSide = {
    base: url,
    login: url + 'user/login',
    signup: url + 'user/signup',
    registerPublisher: url + 'publisher/new',
    getPublisher: url + 'publisher/',
    inviteAuthors: url + 'notif/invite-auth'
};

export default serverSide;