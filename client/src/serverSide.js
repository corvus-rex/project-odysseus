const url = "http://localhost:5000/"
const serverSide = {
    base: url,
    login: url + 'user/login',
    signup: url + 'user/signup',
    registerPublisher: url + 'publisher/new',
    getPublisher: url + 'publisher/',
    findPublisherByID: url + 'publisher/findByID',
    inviteAuthors: url + 'notif/invite-auth',
    acceptAuthorship: url + 'publisher/accept-author',
    getNotifs: url + 'notif/get-notifs',
    changeNotifStatus: url + 'notif/change-status'
};

export default serverSide;