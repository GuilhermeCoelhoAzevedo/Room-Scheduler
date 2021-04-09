/***********************************************************************************/
/********************************General functions**********************************/
/***********************************************************************************/
setTimeout(function() {
    $('#flashMessage').fadeOut('fast');
}, 2000); 

/***********************************************************************************/
/********************************Firebase functions*********************************/
/***********************************************************************************/
if(document.getElementById('sign-out')) {
    document.getElementById('sign-out').onclick = function() {
        // ask firebase to sign out the user
        firebase.auth().signOut();
    };
};

var uiConfig = {
    signInSuccessUrl: '/login',
    signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        //CREATE COOKIE WITH THE USER DATA
        user.getIdToken().then(function(token) {
        document.cookie = "token=" + token;
    });
    } else {
        //CREATE LOGIN CONTAINER
        if(document.getElementById('firebase-auth-container')) {
            var ui = new firebaseui.auth.AuthUI(firebase.auth());
            ui.start('#firebase-auth-container', uiConfig);
        }
        document.cookie = "token=";
    }
    }, function(error) {
        alert('Unable to log in: ' + error);
    }
);