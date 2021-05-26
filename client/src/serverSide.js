const url = "http://localhost:5000/"
const serverSide = {
    base: url,
    findUserByID: url + 'user/findByID',
    login: url + 'user/login',
    signup: url + 'user/signup',
    registerPublisher: url + 'publisher/new',
    getPublisher: url + 'publisher/',
    findPublisherByID: url + 'publisher/findByID',
    inviteAuthors: url + 'notif/invite-auth',
    acceptAuthorship: url + 'publisher/accept-author',
    revokeAuthorship: url + 'publisher/revoke-author',
    getDraft: url + 'publisher/get-draft',
    getDrafts: url + 'publisher/get-drafts',
    newDraft: url + 'publisher/new-draft',
    editDraft: url + 'publisher/edit-draft',
    getNotifs: url + 'notif/get-notifs',
    changeNotifStatus: url + 'notif/change-status',
};

export default serverSide;